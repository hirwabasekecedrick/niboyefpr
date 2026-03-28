'use client'

import { useState, useTransition } from 'react'
import { registerForActivity } from '@/app/actions/activities'
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react'

interface EventRegistrationProps {
    activityId: string
    isAlreadyRegistered: boolean
}

export function EventRegistration({ activityId, isAlreadyRegistered }: EventRegistrationProps) {
    const [isPending, startTransition] = useTransition()
    const [registered, setRegistered] = useState(isAlreadyRegistered)

    const handleRegister = () => {
        startTransition(async () => {
            const res = await registerForActivity(activityId)
            if (res.success) {
                setRegistered(true)
            } else {
                alert(res.error || 'Failed to register')
            }
        })
    }

    if (registered) {
        return (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-green-800">You're Registered!</h3>
                <p className="text-xs text-green-700 mt-1">Your participation has been recorded. We'll see you there!</p>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm shadow-indigo-50/50 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Event Participation</h3>
            </div>

            <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium">
                Register now to confirm your attendance and help us prepare for a successful event.
            </p>

            <button
                onClick={handleRegister}
                disabled={isPending}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    'Confirm My Attendance'
                )}
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-tighter">Verified Member Exclusive Action</p>
        </div>
    )
}
