'use server'

import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getVillagePerformance(cellId?: string) {
    try {
        const where: any = {}
        if (cellId) where.cellId = cellId

        const villages = (await prisma.village.findMany({
            where,
            include: {
                _count: { select: { users: true } },
                users: {
                    include: { attendances: { where: { isConfirmed: true } } }
                },
                cell: { select: { id: true, name: true } }
            }
        })) as any[]

        const villageLeaders = await prisma.user.findMany({
            where: {
                role: 'VILLAGE_LEADER',
                ...(cellId ? { cellId } : {})
            },
            select: { villageId: true, lastSeen: true, name: true, id: true }
        })

        const leaderByVillage = Object.fromEntries(
            villageLeaders
                .filter(l => l.villageId)
                .map(l => [l.villageId!, l])
        )

        const now = new Date()
        const ONLINE_THRESHOLD_MS = 5 * 60 * 1000

        const performance = villages.map(v => {
            const attendanceCount = v.users.reduce((sum, user) => {
                return sum + user.attendances.length
            }, 0)

            const leader = leaderByVillage[v.id]
            const isOnline = leader?.lastSeen
                ? now.getTime() - new Date(leader.lastSeen).getTime() < ONLINE_THRESHOLD_MS
                : false

            return {
                id: v.id,
                name: v.name,
                cellId: v.cellId,
                cellName: v.cell.name,
                memberCount: v._count.users,
                attendanceCount,
                leaderName: leader?.name || null,
                isOnline
            }
        })

        return performance.sort((a, b) => b.attendanceCount - a.attendanceCount)
    } catch (error) {
        console.error('Error calculating performance:', error)
        return []
    }
}

export async function getCellPerformance() {
    try {
        const cells = (await prisma.cell.findMany({
            include: {
                villages: {
                    include: {
                        _count: { select: { users: true } },
                        users: {
                            include: { attendances: { where: { isConfirmed: true } } }
                        }
                    }
                }
            }
        })) as any[]

        const villageLeaders = await prisma.user.findMany({
            where: { role: 'VILLAGE_LEADER' },
            select: { villageId: true, lastSeen: true, name: true }
        })
        const leaderByVillage = Object.fromEntries(
            villageLeaders.filter(l => l.villageId).map(l => [l.villageId!, l])
        )
        const now = new Date()
        const ONLINE_THRESHOLD_MS = 5 * 60 * 1000

        const performance = cells.map(c => {
            let totalCellAttendance = 0
            let totalCellMembers = 0

            const villages = c.villages.map(v => {
                const totalVillageAttendance = v.users.reduce(
                    (sum, user) => sum + user.attendances.length, 0
                )
                totalCellAttendance += totalVillageAttendance
                totalCellMembers += v._count.users

                const leader = leaderByVillage[v.id]
                const isOnline = leader?.lastSeen
                    ? now.getTime() - new Date(leader.lastSeen).getTime() < ONLINE_THRESHOLD_MS
                    : false

                return {
                    id: v.id,
                    name: v.name,
                    memberCount: v._count.users,
                    attendanceCount: totalVillageAttendance,
                    leaderName: leader?.name || null,
                    isOnline
                }
            })

            return {
                id: c.id,
                name: c.name,
                memberCount: totalCellMembers,
                attendanceCount: totalCellAttendance,
                villages: villages.sort((a, b) => b.attendanceCount - a.attendanceCount)
            }
        })

        return performance.sort((a, b) => b.attendanceCount - a.attendanceCount)
    } catch (error) {
        console.error('Error calculating cell performance:', error)
        return []
    }
}
