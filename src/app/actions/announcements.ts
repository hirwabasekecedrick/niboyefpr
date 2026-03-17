'use server'

import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createAnnouncement(formData: FormData) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return { success: false, error: 'Unauthorized' }

        const title = formData.get('title') as string
        const content = formData.get('content') as string
        const level = formData.get('level') as 'VILLAGE' | 'CELL' | 'SECTOR'

        if (!title || !content || !level) {
            return { success: false, error: 'All fields are required' }
        }

        await prisma.announcement.create({
            data: {
                title,
                content,
                level,
                authorId: session.user.id,
            },
        })

        revalidatePath('/dashboard/announcements')
        return { success: true }
    } catch (error) {
        console.error('Error creating announcement:', error)
        return { success: false, error: 'Failed to create announcement' }
    }
}

export async function getAnnouncements() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return []

        const user = session.user

        // Cascading logic:
        // 1. All Sector level announcements
        // 2. Cell level announcements for the user's cell
        // 3. Village level announcements for the user's village

        return await prisma.announcement.findMany({
            where: {
                OR: [
                    { level: 'SECTOR' },
                    {
                        level: 'CELL',
                        author: {
                            role: 'CELL_ADMIN',
                            cellId: user.cellId
                        }
                    },
                    {
                        level: 'VILLAGE',
                        author: {
                            role: 'VILLAGE_LEADER',
                            villageId: user.villageId
                        }
                    }
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { name: true, role: true }
                }
            }
        })
    } catch (error) {
        console.error('Error fetching announcements:', error)
        return []
    }
}
