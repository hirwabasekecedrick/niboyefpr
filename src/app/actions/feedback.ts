'use server'

import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function submitFeedback(formData: FormData) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return { success: false, error: 'Unauthorized' }

        const message = formData.get('message') as string

        if (!message) return { success: false, error: 'Message is required' }

        await prisma.feedback.create({
            data: {
                message,
                authorId: session.user.id,
            },
        })

        revalidatePath('/dashboard/feedback')
        return { success: true }
    } catch (error) {
        console.error('Error submitting feedback:', error)
        return { success: false, error: 'Failed to submit feedback' }
    }
}

export async function getFeedback() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return []

        // Sector and Cell admins can see all feedback
        if (['SECTOR_ADMIN', 'CELL_ADMIN'].includes(session.user.role)) {
            return await prisma.feedback.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    author: { select: { name: true, role: true } }
                }
            })
        }

        // Members only see their own feedback
        return await prisma.feedback.findMany({
            where: { authorId: session.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { name: true, role: true } }
            }
        })
    } catch (error) {
        console.error('Error fetching feedback:', error)
        return []
    }
}
