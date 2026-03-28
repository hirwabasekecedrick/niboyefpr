'use client'

import { useTransition } from 'react'
import { deleteAnnouncement } from '@/app/actions/announcements'
import { Trash2, Loader2 } from 'lucide-react'

export function DeleteAnnouncementButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this announcement?')) {
            startTransition(async () => {
                await deleteAnnouncement(id)
            })
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-red-50 rounded-md"
            title="Delete Announcement"
        >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
    )
}
