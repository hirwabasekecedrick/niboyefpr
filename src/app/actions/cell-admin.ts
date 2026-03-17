'use server'

import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getMembersForCellAdmin(cellId: string) {
    try {
        return await prisma.user.findMany({
            where: {
                cellId,
                role: 'MEMBER'
            },
            include: {
                village: true,
            },
            orderBy: {
                name: 'asc'
            }
        })
    } catch (error) {
        console.error('Error fetching members:', error)
        return []
    }
}

export async function verifyMember(userId: string) {
    try {
        const session = await getServerSession(authOptions)
        // Only CELL_ADMIN and SECTOR_ADMIN should verify users
        if (!session?.user || !['CELL_ADMIN', 'SECTOR_ADMIN'].includes(session.user.role)) {
            return { success: false, error: 'Unauthorized to verify members' }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { isVerified: true }
        })

        return { success: true }
    } catch (error) {
        console.error('Error verifying member:', error)
        return { success: false, error: 'Failed to verify member' }
    }
}
