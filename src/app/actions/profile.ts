'use server'

import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateProfilePicture(url: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return { success: false, error: 'Unauthorized' }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { profilePicture: url } as any
        })

        revalidatePath('/dashboard/profile')
        return { success: true }
    } catch (error) {
        console.error('Error updating profile picture:', error)
        return { success: false, error: 'Failed to update profile picture' }
    }
}
