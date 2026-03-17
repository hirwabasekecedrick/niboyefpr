'use client'

import { useState, useTransition } from 'react'
import { recordContribution } from '@/app/actions/village-leader'
import { Loader2, DollarSign, PlusCircle } from 'lucide-react'

export function RecordContributionForm({
    members,
    onSuccess
}: {
    members: any[],
    onSuccess?: () => void
}) {
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setMessage(null)
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const result = await recordContribution(formData)
            if (result.success) {
                setMessage({ type: 'success', text: 'Contribution recorded successfully!' })
                if (onSuccess) onSuccess()
                    // Reset form
                    ; (e.target as HTMLFormElement).reset()
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to record.' })
            }

            setTimeout(() => setMessage(null), 3000)
        })
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-primary" />
                    Record New Contribution
                </h2>
            </div>

            <div className="p-6">
                {message && (
                    <div className={`mb-6 p-4 rounded-md border-l-4 text-sm font-medium ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border-green-500'
                            : 'bg-red-50 text-primary border-primary'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Member</label>
                        <select
                            name="memberId"
                            required
                            className="w-full h-11 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                            defaultValue=""
                        >
                            <option value="" disabled>Select a member...</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.name} (ID: {m.nationalId})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            Amount (RWF)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-slate-500 sm:text-sm">RWF</span>
                            </div>
                            <input
                                type="number"
                                name="amount"
                                min="100"
                                step="100"
                                required
                                placeholder="1000"
                                className="w-full h-11 pl-12 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending || members.length === 0}
                        className="w-full h-11 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-md shadow-sm transition-colors mt-2 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isPending ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                        ) : (
                            'Record Contribution'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
