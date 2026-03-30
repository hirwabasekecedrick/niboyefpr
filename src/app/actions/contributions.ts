'use server'

import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Level } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function getContributions(filters?: { memberId?: string; recordedById?: string }) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return null

    const where: Prisma.ContributionWhereInput = {}
    if (filters?.memberId) where.memberId = filters.memberId
    if (filters?.recordedById) where.recordedById = filters.recordedById

    // Village Leader: only see contributions for members in their village
    if (session.user.role === 'VILLAGE_LEADER' && session.user.villageId) {
        where.member = { villageId: session.user.villageId }
    }

    // Cell Admin: only see contributions for members in their cell
    if (session.user.role === 'CELL_ADMIN' && session.user.cellId) {
        where.member = { cellId: session.user.cellId }
    }

    return await prisma.contribution.findMany({
        where,
        orderBy: { date: 'desc' },
        include: {
            member: {
                select: { id: true, name: true, nationalId: true, villageId: true, village: { select: { name: true } } }
            },
            recordedBy: {
                select: { id: true, name: true }
            }
        }
    })
}

export async function createContribution(data: {
    amount: number;
    memberId: string;
    description?: string;
    date?: Date;
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { success: false, error: "Unauthorized" }

    const userRole = session.user.role as string
    if (userRole !== "VILLAGE_LEADER") {
        return { success: false, error: "Insufficient permissions. Only Village Leaders can record contributions." }
    }

    // Verify the member belongs to the leader's village
    if (session.user.villageId) {
        const member = await prisma.user.findUnique({
            where: { id: data.memberId },
            select: { villageId: true }
        })
        if (member?.villageId !== session.user.villageId) {
            return { success: false, error: "This member does not belong to your village." }
        }
    }

    try {
        const contribution = await prisma.contribution.create({
            data: {
                amount: data.amount,
                memberId: data.memberId,
                recordedById: session.user.id,
                description: data.description,
                date: data.date ? new Date(data.date) : new Date(),
            } as any
        })
        revalidatePath('/dashboard/contributions')
        return { success: true, data: contribution }
    } catch (error) {
        console.error("Failed to create contribution:", error)
        return { success: false, error: "Failed to create contribution" }
    }
}

export async function updateContribution(id: string, data: {
    amount?: number;
    description?: string;
    date?: Date;
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { success: false, error: "Unauthorized" }

    const userRole = session.user.role as string
    if (userRole !== "VILLAGE_LEADER") {
        return { success: false, error: "Insufficient permissions. Only Village Leaders can update contributions." }
    }

    try {
        const contribution = await prisma.contribution.update({
            where: { id },
            data: {
                ...(data.amount && { amount: data.amount }),
                ...(data.description && { description: data.description }),
                ...(data.date && { date: new Date(data.date) }),
            }
        })
        revalidatePath('/dashboard/contributions')
        return { success: true, data: contribution }
    } catch (error) {
        console.error("Failed to update contribution:", error)
        return { success: false, error: "Failed to update contribution" }
    }
}

export async function deleteContribution(id: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { success: false, error: "Unauthorized" }

    const userRole = session.user.role as string
    if (userRole !== "VILLAGE_LEADER" && userRole !== "SECTOR_ADMIN") {
        return { success: false, error: "Insufficient permissions." }
    }

    try {
        await prisma.contribution.delete({ where: { id } })
        revalidatePath('/dashboard/contributions')
        return { success: true }
    } catch (error) {
        console.error("Failed to delete contribution:", error)
        return { success: false, error: "Failed to delete contribution" }
    }
}

export async function findMemberByNationalId(nationalId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return null

    try {
        const user = await prisma.user.findUnique({
            where: { nationalId },
            select: { id: true, name: true, nationalId: true, villageId: true }
        })
        return user
    } catch (error) {
        console.error("Error finding member:", error)
        return null
    }
}

// Get aggregated village contribution totals for Cell/Sector admins
export async function getVillageContributionSummary(cellId?: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return []

    const role = session.user.role
    if (role !== 'CELL_ADMIN' && role !== 'SECTOR_ADMIN') return []

    const villageWhere: any = {}
    if (role === 'CELL_ADMIN' && session.user.cellId) {
        villageWhere.cellId = session.user.cellId
    } else if (cellId) {
        villageWhere.cellId = cellId
    }

    const villages = await prisma.village.findMany({
        where: villageWhere,
        include: {
            _count: { select: { users: true } },
            users: {
                include: {
                    contributions: { select: { amount: true } }
                }
            }
        },
        orderBy: { name: 'asc' }
    })

    return villages.map(v => {
        const totalContribution = v.users.reduce((sum, u) =>
            sum + u.contributions.reduce((cs, c) => cs + c.amount, 0), 0)
        return {
            villageId: v.id,
            villageName: v.name,
            memberCount: v._count.users,
            totalContribution
        }
    })
}
