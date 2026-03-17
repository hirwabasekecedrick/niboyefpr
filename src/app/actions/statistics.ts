'use server'

import prisma from '@/lib/prisma'

export async function getSystemStats() {
    try {
        const totalMembers = await prisma.user.count({ where: { role: 'MEMBER' } })
        const totalVillages = await prisma.village.count()
        const totalCells = await prisma.cell.count()
        const totalContribution = await prisma.contribution.aggregate({
            _sum: { amount: true }
        })

        const contributionsByMonth = await prisma.contribution.groupBy({
            by: ['date'],
            _sum: { amount: true },
            orderBy: { date: 'asc' },
            take: 6
        })

        return {
            totalMembers,
            totalVillages,
            totalCells,
            totalContributionRwf: totalContribution._sum.amount || 0,
            monthlyData: contributionsByMonth.map(item => ({
                month: new Date(item.date).toLocaleString('default', { month: 'short' }),
                amount: item._sum.amount || 0
            }))
        }
    } catch (error) {
        console.error('Error fetching system stats:', error)
        return null
    }
}

export async function getVillageGrading() {
    try {
        const villages = await prisma.village.findMany({
            include: {
                users: {
                    include: { attendances: true, contributions: true }
                }
            }
        })

        return villages.map(v => {
            const memberCount = v.users.length
            const totalContribution = v.users.reduce((sum, u) => sum + u.contributions.reduce((us, c) => us + c.amount, 0), 0)

            // Basic grading logic
            let grade = 'C'
            if (totalContribution > 500000) grade = 'A'
            else if (totalContribution > 200000) grade = 'B'

            return {
                id: v.id,
                name: v.name,
                memberCount,
                totalContribution,
                grade
            }
        }).sort((a, b) => b.totalContribution - a.totalContribution)
    } catch (error) {
        console.error('Error calculating grading:', error)
        return []
    }
}
