'use server'

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function getSectors() {
    return await prisma.sector.findMany({
        orderBy: { name: 'asc' }
    })
}

export async function getCellsBySector(sectorId: string) {
    if (!sectorId) return []
    return await prisma.cell.findMany({
        where: { sectorId },
        orderBy: { name: 'asc' }
    })
}

export async function getVillagesByCell(cellId: string) {
    if (!cellId) return []
    return await prisma.village.findMany({
        where: { cellId },
        orderBy: { name: 'asc' }
    })
}

export async function registerMember(formData: FormData) {
    const fullName = formData.get('fullName') as string
    const nationalId = formData.get('nationalId') as string
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string
    const sectorId = formData.get('sectorId') as string
    const cellId = formData.get('cellId') as string
    const villageId = formData.get('villageId') as string

    if (!nationalId || nationalId.length !== 16) {
        return { success: false, error: "National ID must be 16 digits." }
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { nationalId }
        })

        if (existingUser) {
            return { success: false, error: "A user with this National ID already exists." }
        }

        const passwordHash = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                name: fullName,
                nationalId,
                phone,
                passwordHash,
                role: 'MEMBER',
                isVerified: false,
                sectorId,
                cellId,
                villageId
            }
        })

        return { success: true }
    } catch (error: any) {
        console.error("Registration error:", error)
        return { success: false, error: "An unexpected error occurred during registration." }
    }
}

export async function getMemberData() {
    const session = await getServerSession(authOptions)
    if (!session?.user) return null

    const userId = session.user.id

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            village: true,
            cell: true,
            sector: true
        }
    })

    if (!user) return null

    // Fetch local activities
    const activities = await prisma.activity.findMany({
        orderBy: { date: 'desc' },
        take: 3
    })

    // Fetch local announcements
    const announcements = await prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3
    })

    return {
        user,
        activities,
        announcements
    }
}
