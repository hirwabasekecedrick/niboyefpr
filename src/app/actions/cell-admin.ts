'use server'

import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getMembersForAdmin(cellId?: string, sectorId?: string) {
    try {
        const where: any = { role: 'MEMBER' }
        if (cellId) {
            where.cellId = cellId
        } else if (sectorId) {
            where.sectorId = sectorId
        }

        return await prisma.user.findMany({
            where,
            include: {
                village: true,
                cell: true,
                contributions: { select: { amount: true } }
            },
            orderBy: { name: 'asc' }
        })
    } catch (error) {
        console.error('Error fetching members:', error)
        return []
    }
}

export async function getVillagesForAdmin(cellId?: string) {
    try {
        const where: any = {}
        if (cellId) where.cellId = cellId

        const villages = await prisma.village.findMany({
            where,
            include: {
                cell: true,
                _count: { select: { users: true } },
                users: {
                    where: { role: 'VILLAGE_LEADER' },
                    select: { id: true, name: true, lastSeen: true }
                }
            },
            orderBy: { name: 'asc' }
        })

        const now = new Date()
        const ONLINE_THRESHOLD_MS = 5 * 60 * 1000

        return villages.map(v => {
            const leader = v.users[0] || null
            return {
                ...v,
                leader,
                isLeaderOnline: leader?.lastSeen
                    ? now.getTime() - new Date(leader.lastSeen).getTime() < ONLINE_THRESHOLD_MS
                    : false
            }
        })
    } catch (error) {
        console.error('Error fetching villages:', error)
        return []
    }
}

export async function getVillageWithMembers(villageId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return null
        if (!['CELL_ADMIN', 'SECTOR_ADMIN'].includes(session.user.role)) return null

        const village = await prisma.village.findUnique({
            where: { id: villageId },
            include: {
                cell: { select: { name: true } },
                users: {
                    where: { role: 'MEMBER', isVerified: true },
                    include: {
                        contributions: { select: { amount: true } }
                    },
                    orderBy: { name: 'asc' }
                }
            }
        })

        if (!village) return null

        // Map members with total contributions
        const members = village.users.map(u => ({
            id: u.id,
            name: u.name,
            nationalId: u.nationalId,
            phone: u.phone,
            totalContributions: u.contributions.reduce((s, c) => s + c.amount, 0)
        }))

        return {
            id: village.id,
            name: village.name,
            cellName: village.cell.name,
            members
        }
    } catch (error) {
        console.error('Error fetching village with members:', error)
        return null
    }
}

export async function registerVillage(data: { name: string, cellId: string }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || !['CELL_ADMIN', 'SECTOR_ADMIN'].includes(session.user.role)) {
            return { success: false, error: 'Unauthorized to register villages' }
        }

        const newVillage = await prisma.village.create({
            data: {
                name: data.name,
                cellId: data.cellId
            },
            include: {
                cell: { select: { name: true, sectorId: true } }
            }
        })

        // Find Sector Admins for this sector and notify them
        const sectorAdmins = await prisma.user.findMany({
            where: { sectorId: newVillage.cell.sectorId, role: 'SECTOR_ADMIN' },
            select: { id: true }
        })

        for (const admin of sectorAdmins) {
            await (prisma as any).notification.create({
                data: {
                    userId: admin.id,
                    title: 'New Village Registered',
                    message: `${newVillage.name} has been added to ${newVillage.cell.name} Cell.`,
                    type: 'INFO'
                }
            })
        }

        revalidatePath('/dashboard/villages')
        return { success: true, data: newVillage }
    } catch (error) {
        console.error('Error registering village:', error)
        return { success: false, error: 'Failed to register village' }
    }
}
