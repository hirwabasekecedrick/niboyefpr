'use client'

import { useState, useEffect, useTransition } from 'react'
import { getMembersForCellAdmin, verifyMember } from '@/app/actions/cell-admin'
import { Users, CheckCircle, Clock, ShieldAlert, Loader2 } from 'lucide-react'

export default function MemberManagementClient({ cellId }: { cellId: string }) {
    const [members, setMembers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [actionStatus, setActionStatus] = useState<{ id: string, status: 'verifying' | 'success' | 'error' } | null>(null)

    useEffect(() => {
        loadMembers()
    }, [cellId])

    async function loadMembers() {
        setLoading(true)
        const data = await getMembersForCellAdmin(cellId)
        setMembers(data)
        setLoading(false)
    }

    async function handleVerify(userId: string) {
        if (!confirm('Are you sure you want to verify this member?')) return

        setActionStatus({ id: userId, status: 'verifying' })

        startTransition(async () => {
            const result = await verifyMember(userId)
            if (result.success) {
                setActionStatus({ id: userId, status: 'success' })
                // Update local state without refetching immediately
                setMembers(prev => prev.map(m => m.id === userId ? { ...m, isVerified: true } : m))
            } else {
                setActionStatus({ id: userId, status: 'error' })
                alert(result.error)
            }

            setTimeout(() => {
                setActionStatus(null)
            }, 2000)
        })
    }

    const pendingMembers = members.filter(m => !m.isVerified)
    const verifiedMembers = members.filter(m => m.isVerified)

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 rounded-full">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Cell Members</p>
                        <h3 className="text-2xl font-bold text-slate-800">{members.length}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 rounded-full">
                        <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Pending Verification</p>
                        <h3 className="text-2xl font-bold text-slate-800">{pendingMembers.length}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-full">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Verified</p>
                        <h3 className="text-2xl font-bold text-slate-800">{verifiedMembers.length}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-primary" />
                        Members Requiring Verification
                    </h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {pendingMembers.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No members pending verification.
                        </div>
                    ) : (
                        pendingMembers.map(member => (
                            <div key={member.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-slate-800">{member.name}</h3>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 text-sm text-slate-500 mt-1">
                                        <span>ID: {member.nationalId}</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span>Phone: {member.phone}</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span>Village: {member.village?.name || 'N/A'}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleVerify(member.id)}
                                    disabled={actionStatus?.id === member.id}
                                    className="flex-shrink-0 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto text-center flex justify-center items-center gap-2"
                                >
                                    {actionStatus?.id === member.id ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                                    ) : (
                                        'Verify Member'
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Verified Members
                    </h2>
                </div>
                <div className="divide-y divide-slate-100 overflow-x-auto">
                    {verifiedMembers.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No verified members found.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                    <th className="px-6 py-3 font-medium">Name</th>
                                    <th className="px-6 py-3 font-medium">National ID</th>
                                    <th className="px-6 py-3 font-medium">Phone</th>
                                    <th className="px-6 py-3 font-medium">Village</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {verifiedMembers.map(member => (
                                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                                        <td className="px-6 py-4 font-medium text-slate-800">{member.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{member.nationalId}</td>
                                        <td className="px-6 py-4 text-slate-600">{member.phone}</td>
                                        <td className="px-6 py-4 text-slate-600">{member.village?.name || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

        </div>
    )
}
