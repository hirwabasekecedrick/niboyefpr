'use client'

import { Trophy, ArrowUpRight, Signal } from 'lucide-react'

export function VillagePerformanceStats({ performance }: { performance: any[] }) {
    const maxContribution = Math.max(...performance.map(p => p.totalContribution), 1)

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-red-50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Village Performance Ranking
                </h2>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-slate-200 px-2 py-0.5 rounded">
                    Contribution Analysis
                </span>
            </div>

            <div className="p-6 space-y-6">
                {performance.map((village, index) => (
                    <div key={village.id} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-slate-100 text-slate-600' :
                                            index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'
                                    }`}>
                                    #{index + 1}
                                </span>
                                <span className="font-bold text-slate-700">{village.name}</span>
                                <span className="text-xs text-slate-400">({village.memberCount} members)</span>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-primary">{village.totalContribution.toLocaleString()} RWF</span>
                            </div>
                        </div>
                        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
                                style={{ width: `${(village.totalContribution / maxContribution) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}

                {performance.length === 0 && (
                    <p className="text-center text-slate-400 text-sm py-4 italic">No performance data available yet.</p>
                )}
            </div>
        </div>
    )
}
