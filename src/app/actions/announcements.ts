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
        const levelInput = formData.get('level') as string
        const level = (levelInput?.toUpperCase() || 'VILLAGE') as 'VILLAGE' | 'CELL' | 'SECTOR'

        const targetRole = formData.get('targetRole') as string | null
        const targetVillageId = formData.get('targetVillageId') as string | null
        const targetCellId = formData.get('targetCellId') as string | null

        if (!title || !content) {
            return { success: false, error: 'Title and content are required' }
        }

        // Auto-set target based on role if not provided
        const data: any = {
            title,
            content,
            level,
            authorId: session.user.id,
        }

        if (targetRole && targetRole !== "") data.targetRole = targetRole
        if (targetVillageId && targetVillageId !== "") data.targetVillageId = targetVillageId
        if (targetCellId && targetCellId !== "") data.targetCellId = targetCellId

        // Village leader's announcements MUST target their village and be at VILLAGE level
        if (session.user.role === 'VILLAGE_LEADER') {
            if (!session.user.villageId) return { success: false, error: 'Village Leader has no assigned village' }
            data.targetVillageId = session.user.villageId
            data.level = 'VILLAGE'
            // Clear other targets just in case
            data.targetCellId = null
            data.targetRole = null
        }
        // Cell admin's announcements auto-target their cell
        else if (session.user.role === 'CELL_ADMIN' && session.user.cellId && !data.targetCellId) {
            data.targetCellId = session.user.cellId
        }

        await prisma.announcement.create({ data })

        revalidatePath('/dashboard/announcements')
        revalidatePath('/dashboard')
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

        // Build OR conditions based on user's role and location
        const orConditions: any[] = [
            { authorId: user.id }, // Always see your own announcements
        ]

        if (user.role === 'SECTOR_ADMIN') {
            // Sector admin sees everything in the sector
            orConditions.push({ level: 'SECTOR' })
            orConditions.push({ level: 'CELL' })
            orConditions.push({ level: 'VILLAGE' })
        } else if (user.role === 'CELL_ADMIN' && user.cellId) {
            // Cell admin sees everything in their cell (as author or target)
            const cellId = user.cellId;
            const villageIds = (await prisma.village.findMany({ where: { cellId } })).map(v => v.id);

            orConditions.push({ level: 'SECTOR', targetCellId: cellId })
            orConditions.push({ level: 'SECTOR', targetCellId: null, targetVillageId: null, targetRole: null })
            orConditions.push({ level: 'CELL', targetCellId: cellId })
            orConditions.push({ level: 'CELL', targetCellId: null })
            orConditions.push({ level: 'VILLAGE', targetCellId: cellId })
            orConditions.push({ level: 'VILLAGE', targetVillageId: { in: villageIds } })
        } else {
            // Members and Village Leaders see targeted or general announcements
            // 1. General Sector announcements for everyone
            orConditions.push({ level: 'SECTOR', targetCellId: null, targetVillageId: null, targetRole: null })

            // 2. Announcements targeted at their specific role
            orConditions.push({ targetRole: user.role })

            if (user.cellId) {
                // 3. Sector announcements targeting their cell
                orConditions.push({ level: 'SECTOR', targetCellId: user.cellId })
                // 4. Cell-level announcements targeting their cell OR general cell announcements
                orConditions.push({ level: 'CELL', targetCellId: user.cellId })
                orConditions.push({ level: 'CELL', targetCellId: null })
            }

            if (user.villageId) {
                // 5. Village-level announcements targeting their village OR general village announcements
                orConditions.push({ level: 'VILLAGE', targetVillageId: user.villageId })
                orConditions.push({ level: 'VILLAGE', targetVillageId: null })
            }
        }

        return await prisma.announcement.findMany({
            where: { OR: orConditions },
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

export async function deleteAnnouncement(id: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || !['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'].includes(session.user.role)) {
            return { success: false, error: 'Unauthorized' }
        }

        const announcement = await prisma.announcement.findUnique({
            where: { id },
            select: { authorId: true }
        })

        if (!announcement) return { success: false, error: 'Announcement not found' }

        // Only author or higher admins can delete
        const isAuthor = announcement.authorId === session.user.id
        const isHigherAdmin = ['CELL_ADMIN', 'SECTOR_ADMIN'].includes(session.user.role)

        if (!isAuthor && !isHigherAdmin) {
            return { success: false, error: 'You do not have permission to delete this announcement' }
        }

        await prisma.announcement.delete({ where: { id } })
        revalidatePath('/dashboard/announcements')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Error deleting announcement:', error)
        return { success: false, error: 'Failed to delete announcement' }
    }
}
