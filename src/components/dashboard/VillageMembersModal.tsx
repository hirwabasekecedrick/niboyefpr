'use client'

import { useState, useEffect } from 'react'
import { getVillageWithMembers } from '@/app/actions/cell-admin'
import { Loader2, X, Users, Wallet } from 'lucide-react'

export default function VillageMembersModal({
    villageId,
    isOpen,
    onClose
}: {
    villageId: string | null
    isOpen: boolean
    onClose: () => void
}) {
    const [loading, setLoading] = useState(false)
    const [villageData, setVillageData] = useState<any>(null)

    useEffect(() => {
        if (isOpen && villageId) {
            fetchData()
        } else {
            setVillageData(null)
        }
    }, [isOpen, villageId])

    async function fetchData() {
        setLoading(true)
        const data = await getVillageWithMembers(villageId!)
        setVillageData(data)
        setLoading(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {loading ? 'Loading...' : villageData?.name || 'Village Details'}
                        </h2>
                        {!loading && villageData && (
                            <p className="text-xs text-slate-500 font-medium">{villageData.cellName} Cell Jurisdiction</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 bg-slate-50/50 flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : villageData ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold">Active Members</p>
                                        <h3 className="text-lg font-bold text-slate-800">{villageData.members.length}</h3>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
                                    <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold">Total Revenue Map</p>
                                        <h3 className="text-lg font-bold text-green-600">
                                            {villageData.members.reduce((s: number, m: any) => s + m.totalContributions, 0).toLocaleString()} RWF
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b bg-slate-50 font-semibold text-slate-700 text-sm">
                                    Member Register
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {villageData.members.length === 0 ? (
                                        <p className="text-center text-slate-400 py-6 text-sm">No verified members registered yet.</p>
                                    ) : (
                                        villageData.members.map((member: any) => (
                                            <div key={member.id} className="p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-white shadow-sm shrink-0">
                                                        {member.profilePicture ? (
                                                            <img src={member.profilePicture} alt={member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Users className="w-5 h-5 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm">{member.name}</h4>
                                                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{member.nationalId} • {member.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-green-600 text-sm">
                                                        {member.totalContributions.toLocaleString()} RWF
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500">Failed to load village data.</div>
                    )}
                </div>
            </div>
        </div>
    )
}
