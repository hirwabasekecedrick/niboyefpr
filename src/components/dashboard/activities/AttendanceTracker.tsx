'use client'

import { useState, useTransition } from 'react'
import { markAttendance } from '@/app/actions/activities'
import { Check, X, Minus, Loader2, User } from 'lucide-react'

export function AttendanceTracker({
    activityId,
    activityTitle,
    members,
    initialAttendances = []
}: {
    activityId: string,
    activityTitle: string,
    members: any[],
    initialAttendances?: any[]
}) {
    const [isPending, startTransition] = useTransition()
    const [attendances, setAttendances] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'EXCUSED'>>(
        Object.fromEntries(initialAttendances.map(a => [a.userId, a.status]))
    )

    const handleToggle = (userId: string, newStatus: 'PRESENT' | 'ABSENT' | 'EXCUSED') => {
        // If same status clicked, toggle to "None" (conceptually delete or reset)
        // But system implies choosing one. Let's just update.

        startTransition(async () => {
            const res = await markAttendance(activityId, newStatus)
            if (res.success) {
                setAttendances(prev => ({ ...prev, [userId]: newStatus }))
            }
        })
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-red-50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-800">{activityTitle}</h3>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Real-time Digital Register</p>
                </div>
                {isPending && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </div>

            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                {members.map((member) => (
                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${attendances[member.id] === 'PRESENT' ? 'bg-green-50 border-green-200 text-green-600' :
                                    attendances[member.id] === 'ABSENT' ? 'bg-red-50 border-red-200 text-primary' :
                                        attendances[member.id] === 'EXCUSED' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                                            'bg-slate-50 border-slate-200 text-slate-400'
                                }`}>
                                <User className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">{member.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono tracking-tighter">{member.nationalId}</p>
                            </div>
                        </div>

                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button
                                onClick={() => handleToggle(member.id, 'PRESENT')}
                                className={`p-1.5 rounded-md transition-all ${attendances[member.id] === 'PRESENT'
                                        ? 'bg-white text-green-600 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                title="Present"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleToggle(member.id, 'ABSENT')}
                                className={`p-1.5 rounded-md transition-all ${attendances[member.id] === 'ABSENT'
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                title="Absent"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleToggle(member.id, 'EXCUSED')}
                                className={`p-1.5 rounded-md transition-all ${attendances[member.id] === 'EXCUSED'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                title="Excused"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
