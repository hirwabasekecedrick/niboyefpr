'use client'

import { BarChart3, TrendingUp, Users, Building2, Trophy, Calendar } from 'lucide-react'

export function StatisticsOverview({ stats, grading }: { stats: any, grading: any[] }) {
    if (!stats) return null

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-red-50 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                        <Users className="w-4 h-4 text-primary" /> Members
                    </div>
                    <div className="text-2xl font-black text-slate-800">{stats.totalMembers}</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-red-50 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                        <Building2 className="w-4 h-4 text-primary" /> Villages
                    </div>
                    <div className="text-2xl font-black text-slate-800">{stats.totalVillages}</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-red-50 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                        <Calendar className="w-4 h-4 text-primary" /> Activities
                    </div>
                    <div className="text-2xl font-black text-slate-800">{stats.totalActivities} <span className="text-xs font-medium">Events</span></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-red-50 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                        <Trophy className="w-4 h-4 text-primary" /> Participants
                    </div>
                    <div className="text-2xl font-black text-slate-800">{stats.totalParticipation}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-red-50 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Monthly Activity Volume
                    </h2>
                    <div className="h-64 flex items-end gap-2 pt-8">
                        {stats.monthlyData.map((d: any) => (
                            <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
                                <div
                                    className="w-full bg-red-100 group-hover:bg-primary transition-colors rounded-t-md relative"
                                    style={{ height: `${(d.count / Math.max(...stats.monthlyData.map((m: any) => m.count), 1)) * 100}%` }}
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {d.count}
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-red-50 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Participation Ranking
                    </h2>
                    <div className="space-y-3">
                        {grading.slice(0, 5).map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-red-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${item.grade === 'A' ? 'bg-green-100 text-green-700' :
                                        item.grade === 'B' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                        {item.grade}
                                    </div>
                                    <span className="font-bold text-slate-700">{item.name}</span>
                                </div>
                                <div className="text-sm font-black text-primary">
                                    {item.attendanceRate}% Participation
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
