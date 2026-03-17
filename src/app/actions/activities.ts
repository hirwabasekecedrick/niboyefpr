'use server'

import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createActivity(formData: FormData) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || session.user.role === 'MEMBER') return { success: false, error: 'Unauthorized' }

        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const dateStr = formData.get('date') as string
        const level = formData.get('level') as 'VILLAGE' | 'CELL' | 'SECTOR'

        if (!title || !dateStr || !level) {
            return { success: false, error: 'Title, Date, and Level are required' }
        }

        await prisma.activity.create({
            data: {
                title,
                description,
                date: new Date(dateStr),
                level,
                authorId: session.user.id,
            },
        })

        revalidatePath('/dashboard/activities')
        return { success: true }
    } catch (error) {
        console.error('Error creating activity:', error)
        return { success: false, error: 'Failed to create activity' }
    }
}

export async function getActivities() {
    try {
        return await prisma.activity.findMany({
            orderBy: { date: 'asc' },
            include: {
                author: { select: { name: true, role: true } },
                _count: { select: { attendances: true } }
            }
        })
    } catch (error) {
        console.error('Error fetching activities:', error)
        return []
    }
}

export async function markAttendance(activityId: string, status: 'PRESENT' | 'ABSENT' | 'EXCUSED') {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return { success: false, error: 'Unauthorized' }

        await prisma.attendance.upsert({
            where: {
                userId_activityId: {
                    userId: session.user.id,
                    activityId
                }
            },
            update: { status },
            create: {
                userId: session.user.id,
                activityId,
                status
            }
        })

        revalidatePath('/dashboard/activities')
        return { success: true }
    } catch (error) {
        console.error('Error marking attendance:', error)
        return { success: false, error: 'Failed to mark attendance' }
    }
}

export async function getAttendancesForActivity(activityId: string) {
    try {
        return await prisma.attendance.findMany({
            where: { activityId },
            include: {
                user: { select: { name: true, nationalId: true, role: true } }
            }
        })
    } catch (error) {
        console.error('Error fetching attendances:', error)
        return []
    }
}
