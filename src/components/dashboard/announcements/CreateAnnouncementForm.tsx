'use client'

import { useState, useTransition } from 'react'
import { createAnnouncement } from '@/app/actions/announcements'
import { Megaphone, Loader2 } from 'lucide-react'

export function CreateAnnouncementForm({ userRole }: { userRole: string }) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState('')

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        // Set level based on role if not provided
        let level = 'VILLAGE'
        if (userRole === 'SECTOR_ADMIN') level = 'SECTOR'
        else if (userRole === 'CELL_ADMIN') level = 'CELL'

        formData.append('level', level)

        startTransition(async () => {
            const res = await createAnnouncement(formData)
            if (res.success) {
                ; (e.target as HTMLFormElement).reset()
            } else {
                setError(res.error || 'Failed to create announcement')
            }
        })
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                Post New Announcement
            </h2>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                    <input
                        name="title"
                        required
                        className="w-full h-10 px-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        placeholder="Announcement title"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                    <textarea
                        name="content"
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        placeholder="Write your announcement here..."
                    />
                </div>
                {error && <p className="text-xs text-primary">{error}</p>}
                <button
                    disabled={isPending}
                    className="w-full bg-primary text-white py-2 rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Announcement'}
                </button>
            </form>
        </div>
    )
}
