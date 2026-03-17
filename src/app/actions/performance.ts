'use server'

import prisma from '@/lib/prisma'

export async function getVillagePerformance() {
    try {
        const villages = await prisma.village.findMany({
            include: {
                _count: {
                    select: { users: true }
                },
                users: {
                    include: {
                        contributions: true
                    }
                }
            }
        })

        const performance = villages.map(v => {
            const totalContribution = v.users.reduce((sum, user) => {
                return sum + user.contributions.reduce((uSum, c) => uSum + c.amount, 0)
            }, 0)

            return {
                id: v.id,
                name: v.name,
                memberCount: v._count.users,
                totalContribution
            }
        })

        return performance.sort((a, b) => b.totalContribution - a.totalContribution)
    } catch (error) {
        console.error('Error calculating performance:', error)
        return []
    }
}
