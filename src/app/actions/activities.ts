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
        const description = (formData.get('description') as string) || 'Activity details'
        const dateStr = formData.get('date') as string
        const startTime = formData.get('startTime') as string
        const level = formData.get('level') as any
        const location = (formData.get('location') as string) || null
        const isOnline = formData.get('isOnline') === 'true'
        const onlineLink = (formData.get('onlineLink') as string) || null

        if (!title) return { success: false, error: 'Title is required' }
        if (!dateStr) return { success: false, error: 'Date is required' }
        if (!level) return { success: false, error: 'Level is required' }

        try {
            const date = new Date(dateStr)
            if (isNaN(date.getTime())) {
                return { success: false, error: 'Invalid date format' }
            }

            const activity = await prisma.activity.create({
                data: {
                    title,
                    description,
                    date,
                    startTime,
                    level,
                    location,
                    isOnline,
                    onlineLink,
                    author: {
                        connect: { id: session.user.id }
                    }
                } as any
            })

            console.log('Activity created successfully:', activity.id)
            revalidatePath('/dashboard/activities')
            return { success: true }
        } catch (dbError: any) {
            console.error('Prisma DB Error:', dbError)
            return { success: false, error: `Database error: ${dbError.message || 'Check logs'}` }
        }
    } catch (error: any) {
        console.error('Error in createActivity:', error)
        return { success: false, error: `Server error: ${error.message || 'Unknown error'}` }
    }
}

export async function getActivities() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return []

        const { role, villageId, cellId, sectorId } = session.user as any
        const where: any = {}

        if (role === 'VILLAGE_LEADER' && villageId) {
            where.OR = [
                { author: { villageId } },
                { level: 'VILLAGE', author: { villageId } }
            ]
        } else if (role === 'CELL_ADMIN' && cellId) {
            where.OR = [
                { author: { cellId } },
                { level: 'VILLAGE', author: { cellId } },
                { level: 'CELL', author: { cellId } }
            ]
        } else if (role === 'MEMBER') {
            // Members see all for now or we can filter by their location
            where.OR = [
                { level: 'SECTOR' },
                { level: 'CELL', author: { cellId } },
                { level: 'VILLAGE', author: { villageId } }
            ]
        }
        // Sector admins see all

        return await prisma.activity.findMany({
            where,
            orderBy: { date: 'asc' },
            include: {
                author: { select: { name: true, role: true, villageId: true, cellId: true, sectorId: true } },
                _count: { select: { attendances: true, registrations: true } }
            }
        })
    } catch (error) {
        console.error('Error fetching activities:', error)
        return []
    }
}

export async function markAttendance(activityId: string, status: 'PRESENT' | 'ABSENT' | 'EXCUSED', targetUserId?: string, isScanned: boolean = false) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return { success: false, error: 'Unauthorized' }

        // If targetUserId is provided and different from current user, check for leader role
        const userId = targetUserId || session.user.id
        const isLeader = ['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'].includes(session.user.role)

        if (targetUserId && targetUserId !== session.user.id) {
            if (!isLeader) {
                return { success: false, error: 'Only leaders can mark attendance for others' }
            }
        }

        // Rule: If a leader marks it manually, it's auto-confirmed.
        // If it's a scan (usually by the user themselves), it needs confirmation.
        const isConfirmed = isLeader && !isScanned

            ; (await prisma.attendance.upsert({
                where: {
                    userId_activityId: {
                        userId,
                        activityId
                    }
                },
                update: {
                    status,
                    isConfirmed,
                    confirmedBy: isConfirmed ? session.user.id : null
                } as any,
                create: {
                    userId,
                    activityId,
                    status,
                    isConfirmed,
                    confirmedBy: isConfirmed ? session.user.id : null
                } as any
            }))

        revalidatePath('/dashboard/activities')
        revalidatePath(`/dashboard/activities/${activityId}`)
        return { success: true }
    } catch (error) {
        console.error('Error marking attendance:', error)
        return { success: false, error: 'Failed to mark attendance' }
    }
}

export async function confirmAttendance(attendanceId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || !['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'].includes(session.user.role)) {
            return { success: false, error: 'Unauthorized' }
        }

        await (prisma.attendance.update({
            where: { id: attendanceId },
            data: {
                isConfirmed: true,
                confirmedBy: session.user.id
            } as any
        }))

        revalidatePath('/dashboard/activities')
        return { success: true }
    } catch (error) {
        console.error('Error confirming attendance:', error)
        return { success: false, error: 'Failed to confirm attendance' }
    }
}

export async function registerForActivity(activityId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return { success: false, error: 'Unauthorized' }

        const userId = session.user.id

        await prisma.eventRegistration.upsert({
            where: {
                userId_activityId: {
                    userId,
                    activityId
                }
            },
            update: { registeredAt: new Date() },
            create: {
                userId,
                activityId
            }
        })

        revalidatePath(`/dashboard/activities/${activityId}`)
        return { success: true }
    } catch (error) {
        console.error('Error registering for activity:', error)
        return { success: false, error: 'Failed to register for activity' }
    }
}

export async function getAttendancesForActivity(activityId: string) {
    try {
        return await prisma.attendance.findMany({
            where: { activityId },
            include: {
                user: { select: { id: true, name: true, nationalId: true, role: true } }
            }
        })
    } catch (error) {
        console.error('Error fetching attendances:', error)
        return []
    }
}

export async function getExpectedAttendees(activityId: string) {
    try {
        // Fetch users who either registered OR already have an attendance record
        const registrations = await prisma.eventRegistration.findMany({
            where: { activityId },
            include: { user: { select: { id: true, name: true, nationalId: true, role: true } } }
        });

        const attendances = await prisma.attendance.findMany({
            where: { activityId },
            include: { user: { select: { id: true, name: true, nationalId: true, role: true } } }
        });

        const userMap = new Map();

        registrations.forEach(reg => {
            userMap.set(reg.userId, reg.user);
        });

        attendances.forEach(att => {
            userMap.set(att.userId, att.user);
        });

        return Array.from(userMap.values());
    } catch (error) {
        console.error('Error fetching expected attendees:', error)
        return []
    }
}

export async function searchMembersForActivity(query: string, level: string, cellId?: string, sectorId?: string) {
    try {
        if (!query || query.length < 3) return [];

        const where: any = {
            role: 'MEMBER',
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { nationalId: { contains: query } }
            ]
        };

        if (level === 'CELL' && cellId) {
            where.cellId = cellId;
        } else if (level === 'SECTOR' && sectorId) {
            where.sectorId = sectorId;
        } else if (level === 'VILLAGE') {
            // Usually we don't need search for village as it is small, but if we do, we'd filter by villageId
        }

        return await prisma.user.findMany({
            where,
            select: { id: true, name: true, nationalId: true, role: true },
            take: 10
        });
    } catch (error) {
        console.error('Error searching members:', error);
        return [];
    }
}
