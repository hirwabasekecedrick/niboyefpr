'use server'

import prisma from '@/lib/prisma'

export async function getSystemStats() {
    try {
        const totalMembers = await prisma.user.count({ where: { role: 'MEMBER' } })
        const totalVillages = await prisma.village.count()
        const totalCells = await prisma.cell.count()
        const totalActivities = await prisma.activity.count()
        const totalParticipation = await prisma.attendance.count({
            where: { status: 'PRESENT' }
        })

        const activitiesByMonth = await prisma.activity.groupBy({
            by: ['date'],
            _count: { id: true },
            orderBy: { date: 'asc' },
            take: 6
        })

        return {
            totalMembers,
            totalVillages,
            totalCells,
            totalActivities,
            totalParticipation,
            monthlyData: activitiesByMonth.map(item => ({
                month: new Date(item.date).toLocaleString('default', { month: 'short' }),
                count: item._count.id || 0
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
                    include: { attendances: true }
                }
            }
        })

        return villages.map(v => {
            const memberCount = v.users.length
            const totalAttendances = v.users.reduce((sum, u) => sum + u.attendances.length, 0)
            const attendanceRate = memberCount > 0 ? (totalAttendances / memberCount) * 100 : 0

            // Participation-based grading
            let grade = 'C'
            if (attendanceRate > 80) grade = 'A'
            else if (attendanceRate > 50) grade = 'B'

            return {
                id: v.id,
                name: v.name,
                memberCount,
                attendanceRate: Math.round(attendanceRate),
                grade
            }
        }).sort((a, b) => b.attendanceRate - a.attendanceRate)
    } catch (error) {
        console.error('Error calculating grading:', error)
        return []
    }
}
