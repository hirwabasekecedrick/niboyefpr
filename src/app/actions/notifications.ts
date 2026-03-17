'use server'

import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getNotifications() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return []

        return await (prisma as any).notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        })
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return []
    }
}

export async function markNotificationAsRead(id: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return { success: false }

        await (prisma as any).notification.update({
            where: { id, userId: session.user.id },
            data: { isRead: true }
        })

        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Error marking notification as read:', error)
        return { success: false }
    }
}

export async function createNotification(userId: string, title: string, message: string, type: 'INFO' | 'WARNING' | 'SUCCESS') {
    try {
        await (prisma as any).notification.create({
            data: {
                userId,
                title,
                message,
                type
            }
        })
        return { success: true }
    } catch (error) {
        console.error('Error creating notification:', error)
        return { success: false }
    }
}
