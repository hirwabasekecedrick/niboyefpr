'use server'

import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { revalidatePath } from 'next/cache'

export async function submitReport(formData: FormData) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return { success: false, error: 'Unauthorized' }

        const title = formData.get('title') as string
        const content = formData.get('content') as string
        const image = formData.get('image') as File | null

        let imageUrl = null

        if (image && image.size > 0) {
            const bytes = await image.arrayBuffer()
            const buffer = Buffer.from(bytes)

            const uploadDir = path.join(process.cwd(), 'public', 'uploads')
            await mkdir(uploadDir, { recursive: true })

            const fileName = `${Date.now()}-${image.name}`
            const filePath = path.join(uploadDir, fileName)
            await writeFile(filePath, buffer)
            imageUrl = `/uploads/${fileName}`
        }

        const level = session.user.role === 'VILLAGE_LEADER' ? 'VILLAGE' :
            session.user.role === 'CELL_ADMIN' ? 'CELL' : 'SECTOR'

        await prisma.report.create({
            data: {
                title,
                content,
                imageUrl,
                level: level as any,
                authorId: session.user.id,
                villageId: session.user.villageId,
                cellId: session.user.cellId,
                sectorId: session.user.sectorId,
            },
        })

        revalidatePath('/dashboard/reports')
        return { success: true }
    } catch (error) {
        console.error('Error submitting report:', error)
        return { success: false, error: 'Failed to submit report' }
    }
}

export async function getReports() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return []

        return await prisma.report.findMany({
            where: {
                OR: [
                    { authorId: session.user.id }, // My reports
                    { cellId: session.user.cellId }, // Reports in my cell
                    { sectorId: session.user.sectorId } // Reports in my sector
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { name: true, role: true } },
                village: true,
                cell: true
            }
        })
    } catch (error) {
        console.error('Error fetching reports:', error)
        return []
    }
}
