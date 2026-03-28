'use server'

import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { hash } from 'bcryptjs'

export async function getVillageMembers(villageId: string) {
    try {
        return await prisma.user.findMany({
            where: {
                villageId,
                role: 'MEMBER'
            },
            orderBy: { name: 'asc' },
            include: {
                contributions: {
                    select: { amount: true }
                }
            }
        })
    } catch (error) {
        console.error('Error fetching village members:', error)
        return []
    }
}

export async function verifyMember(userId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || session.user.role !== 'VILLAGE_LEADER') {
            return { success: false, error: 'Unauthorized. Only Village Leaders can verify members.' }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { isVerified: true }
        })

        revalidatePath('/dashboard/members')
        return { success: true }
    } catch (error) {
        console.error('Error verifying member:', error)
        return { success: false, error: 'Failed to verify member' }
    }
}

export async function registerMember(data: {
    name: string
    nationalId: string
    phone: string
    villageId: string
    cellId: string
    sectorId: string
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || session.user.role !== 'VILLAGE_LEADER') {
            return { success: false, error: 'Unauthorized. Only Village Leaders can register members.' }
        }

        // Generate a readable default password: name initials + national ID last 4 digits
        const nameParts = data.name.trim().split(' ')
        const initials = nameParts.map((p: string) => p[0].toUpperCase()).join('')
        const idSuffix = data.nationalId.slice(-4)
        const defaultPassword = `${initials}${idSuffix}@FPR`

        const passwordHash = await hash(defaultPassword, 12)

        const newUser = await prisma.user.create({
            data: {
                name: data.name,
                nationalId: data.nationalId,
                phone: data.phone,
                role: 'MEMBER',
                isVerified: true, // Auto-verify since registered by leader
                villageId: data.villageId,
                cellId: data.cellId,
                sectorId: data.sectorId,
                passwordHash
            },
            include: {
                village: { select: { name: true } }
            }
        })

        // Find Sector Admins for this sector and notify them
        const sectorAdmins = await prisma.user.findMany({
            where: { sectorId: data.sectorId, role: 'SECTOR_ADMIN' },
            select: { id: true }
        })

        for (const admin of sectorAdmins) {
            await (prisma as any).notification.create({
                data: {
                    userId: admin.id,
                    title: 'New Member Registered',
                    message: `${newUser.name} has joined ${newUser.village?.name || 'a village'}.`,
                    type: 'INFO'
                }
            })
        }

        revalidatePath('/dashboard/members')
        // Return the default password so the village leader can share it
        return { success: true, data: newUser, defaultPassword }
    } catch (error) {
        console.error('Error registering member:', error)
        return { success: false, error: 'Failed to register member. Ensure the ID is unique.' }
    }
}

export async function updateLastSeen() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return

        await prisma.user.update({
            where: { id: session.user.id },
            data: { lastSeen: new Date() }
        })
    } catch (error) {
        // Silently fail – not critical
        console.error('Error updating lastSeen:', error)
    }
}
