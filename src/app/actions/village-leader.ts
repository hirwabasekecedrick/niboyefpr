'use server'

import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getVillageMembers(villageId: string) {
    try {
        return await prisma.user.findMany({
            where: {
                villageId,
                role: 'MEMBER'
            },
            orderBy: {
                name: 'asc'
            }
        })
    } catch (error) {
        console.error('Error fetching village members:', error)
        return []
    }
}

export async function getContributionsByVillage(villageId: string) {
    try {
        return await prisma.contribution.findMany({
            where: {
                member: {
                    villageId
                }
            },
            include: {
                member: {
                    select: {
                        name: true,
                        nationalId: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        })
    } catch (error) {
        console.error('Error fetching contributions:', error)
        return []
    }
}

export async function recordContribution(formData: FormData) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || !['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'].includes(session.user.role)) {
            return { success: false, error: 'Unauthorized to record contributions' }
        }

        const memberId = formData.get('memberId') as string
        const amountStr = formData.get('amount') as string
        const amount = parseFloat(amountStr)

        if (!memberId || isNaN(amount) || amount <= 0) {
            return { success: false, error: 'Invalid member or amount' }
        }

        await prisma.contribution.create({
            data: {
                amount,
                memberId,
                recordedById: session.user.id
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Error recording contribution:', error)
        return { success: false, error: 'Failed to record contribution' }
    }
}
