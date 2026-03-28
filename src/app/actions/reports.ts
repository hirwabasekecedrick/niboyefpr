'use server'

import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

            const { mkdir, writeFile } = await import('fs/promises')
            const path = (await import('path')).default

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

        const { id, role, villageId, cellId, sectorId } = session.user as any
        const where: any = {}

        if (role === 'VILLAGE_LEADER') {
            where.OR = [
                { authorId: id },
                { villageId: villageId }
            ]
        } else if (role === 'CELL_ADMIN') {
            where.OR = [
                { authorId: id },
                { cellId: cellId }
            ]
        } else if (role === 'SECTOR_ADMIN') {
            where.sectorId = sectorId
        } else {
            // Members see only their own reports
            where.authorId = id
        }

        return await prisma.report.findMany({
            where,
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
