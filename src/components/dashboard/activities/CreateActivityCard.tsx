'use client'

import { useState, useTransition } from 'react'
import { createActivity } from '@/app/actions/activities'
import { Calendar, Loader2, Info } from 'lucide-react'

export function CreateActivityCard({ userRole }: { userRole: string }) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState('')

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const res = await createActivity(formData)
            if (res.success) {
                ; (e.target as HTMLFormElement).reset()
            } else {
                setError(res.error || 'Failed to create activity')
            }
        })
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                New Activity
            </h2>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Activity Title</label>
                    <input
                        name="title"
                        required
                        className="w-full h-10 px-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        placeholder="e.g., Monthly Meeting, Training"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input
                            name="date"
                            type="date"
                            required
                            className="w-full h-10 px-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                        <select
                            name="level"
                            className="w-full h-10 px-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        >
                            <option value="VILLAGE">Village</option>
                            <option value="CELL">Cell</option>
                            <option value="SECTOR">Sector</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        placeholder="Brief details about the activity..."
                    />
                </div>

                {error && <p className="text-xs text-primary">{error}</p>}

                <button
                    disabled={isPending}
                    className="w-full bg-primary text-white py-2 rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Activity'}
                </button>
            </form>
        </div>
    )
}
