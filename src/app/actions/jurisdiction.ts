'use server'

import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getCellsForSector(sectorId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return []

        const cells = await prisma.cell.findMany({
            where: { sectorId },
            include: {
                _count: {
                    select: {
                        users: { where: { isVerified: true } },
                        villages: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        })

        return cells.map(c => ({
            id: c.id,
            name: c.name,
            villageCount: c._count.villages,
            memberCount: c._count.users
        }))
    } catch (error) {
        console.error('Error fetching cells:', error)
        return []
    }
}

export async function getVillagesWithMetrics(cellId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return []

        const villages = await prisma.village.findMany({
            where: { cellId },
            include: {
                _count: {
                    select: {
                        users: { where: { isVerified: true } }
                    }
                },
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
                id: v.id,
                name: v.name,
                memberCount: v._count.users,
                leaderName: leader?.name || 'Vacant',
                isLeaderOnline: leader?.lastSeen
                    ? now.getTime() - new Date(leader.lastSeen).getTime() < ONLINE_THRESHOLD_MS
                    : false
            }
        })
    } catch (error) {
        console.error('Error fetching villages with metrics:', error)
        return []
    }
}

import { Role } from '@prisma/client'

export async function getVillageMembersHierarchical(villageId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return []

        const members = await prisma.user.findMany({
            where: { villageId, isVerified: true },
            select: {
                id: true,
                name: true,
                role: true,
                status: true,
                profilePicture: true,
                phone: true,
                nationalId: true
            } as any
        })

        const roleOrder: any[] = ['VILLAGE_LEADER', 'VICE_VILLAGE_LEADER', 'SECRETARY', 'DISCIPLINE_COMMITTEE', 'INSPECTION_COMMITTEE', 'MEMBER']
        const requiredRoles: any[] = ['VILLAGE_LEADER', 'VICE_VILLAGE_LEADER', 'SECRETARY', 'DISCIPLINE_COMMITTEE', 'INSPECTION_COMMITTEE']

        // Add vacant positions
        const currentRoles = new Set(members.map(m => m.role as any as string))
        const vacancies = requiredRoles
            .filter(role => !currentRoles.has(role as any as string))
            .map(role => ({
                id: `vacant-${role}`,
                name: 'Vacant',
                role: role as any,
                isVacant: true,
                status: 'VACANT',
                profilePicture: null,
                phone: '-',
                nationalId: '-'
            }))

        const all = [...members, ...vacancies] as any[]

        return all.sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role))
    } catch (error) {
        console.error('Error fetching village members hierarchically:', error)
        return []
    }
}
