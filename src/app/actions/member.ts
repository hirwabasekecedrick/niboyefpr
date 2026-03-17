'use server'

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function getSectors() {
    try {
        return await prisma.sector.findMany({
            orderBy: { name: 'asc' },
        })
    } catch (error) {
        console.error('Error fetching sectors:', error)
        return []
    }
}

export async function getCellsBySector(sectorId: string) {
    try {
        return await prisma.cell.findMany({
            where: { sectorId },
            orderBy: { name: 'asc' },
        })
    } catch (error) {
        console.error('Error fetching cells:', error)
        return []
    }
}

export async function getVillagesByCell(cellId: string) {
    try {
        return await prisma.village.findMany({
            where: { cellId },
            orderBy: { name: 'asc' },
        })
    } catch (error) {
        console.error('Error fetching villages:', error)
        return []
    }
}

export async function registerMember(formData: FormData) {
    try {
        const fullName = formData.get('fullName') as string
        const nationalId = formData.get('nationalId') as string
        const phone = formData.get('phone') as string
        const password = formData.get('password') as string
        const sectorId = formData.get('sectorId') as string
        const cellId = formData.get('cellId') as string
        const villageId = formData.get('villageId') as string

        if (!fullName || !nationalId || !phone || !password || !villageId) {
            return { success: false, error: 'All fields are required.' }
        }

        // Hash the default password or user provided password
        const passwordHash = await bcrypt.hash(password, 10)

        // Check if member already exists
        const existing = await prisma.user.findUnique({
            where: { nationalId }
        })

        if (existing) {
            return { success: false, error: 'National ID already registered.' }
        }

        const newMember = await prisma.user.create({
            data: {
                name: fullName,
                nationalId,
                phone,
                passwordHash,
                sectorId,
                cellId,
                villageId,
                role: 'MEMBER',
                // isVerified relies on cell admin to turn true later
                isVerified: false
            }
        })

        return { success: true, memberId: newMember.id }
    } catch (error: any) {
        console.error('Registration error:', error)
        return { success: false, error: 'Failed to register member. Please try again.' }
    }
}
