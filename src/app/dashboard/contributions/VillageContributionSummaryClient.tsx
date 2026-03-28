'use client'

import { TrendingUp, Users, Trophy } from 'lucide-react'

type VillageSummary = {
    villageId: string
    villageName: string
    memberCount: number
    totalContribution: number
}

export default function VillageContributionSummaryClient({ summary }: { summary: VillageSummary[] }) {
    const total = summary.reduce((s, v) => s + v.totalContribution, 0)
    const totalMembers = summary.reduce((s, v) => s + v.memberCount, 0)
    const maxContrib = Math.max(...summary.map(v => v.totalContribution), 1)

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-full">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Total Contributions</p>
                        <h3 className="text-xl font-bold text-slate-800">{total.toLocaleString()} RWF</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-full">
                        <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Total Members</p>
                        <h3 className="text-xl font-bold text-slate-800">{totalMembers}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 rounded-full">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Villages Reporting</p>
                        <h3 className="text-xl font-bold text-slate-800">{summary.length}</h3>
                    </div>
                </div>
            </div>

            {/* Village Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Village Contribution Rankings
                    </h2>
                </div>
                <div className="p-6 space-y-5">
                    {summary.length === 0 ? (
                        <p className="text-center text-slate-400 italic py-4">No contributions recorded yet.</p>
                    ) : (
                        summary
                            .sort((a, b) => b.totalContribution - a.totalContribution)
                            .map((v, i) => (
                                <div key={v.villageId} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    i === 1 ? 'bg-slate-200 text-slate-600' :
                                                        i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'
                                                }`}>
                                                #{i + 1}
                                            </span>
                                            <span className="font-semibold text-slate-700">{v.villageName}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-green-600">{v.totalContribution.toLocaleString()} RWF</span>
                                            <span className="text-xs text-slate-400 ml-2">({v.memberCount} members)</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
                                            style={{ width: `${(v.totalContribution / maxContrib) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>
        </div>
    )
}
