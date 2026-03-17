'use client'

import { useState, useTransition } from 'react'
import { submitFeedback } from '@/app/actions/feedback'
import { MessageSquare, Loader2, Send } from 'lucide-react'

export function FeedbackForm() {
    const [isPending, startTransition] = useTransition()
    const [success, setSuccess] = useState(false)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const res = await submitFeedback(formData)
            if (res.success) {
                setSuccess(true)
                    ; (e.target as HTMLFormElement).reset()
                setTimeout(() => setSuccess(false), 5000)
            }
        })
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                New Feedback
            </h2>

            {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-100 rounded-md text-sm">
                    Thank you! Your feedback has been submitted.
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Message</label>
                    <textarea
                        name="message"
                        required
                        rows={5}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        placeholder="Share your suggestions or report an issue..."
                    />
                </div>

                <button
                    disabled={isPending}
                    className="w-full bg-primary text-white py-2.5 rounded-md font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Submit Feedback</>}
                </button>
            </form>
        </div>
    )
}
