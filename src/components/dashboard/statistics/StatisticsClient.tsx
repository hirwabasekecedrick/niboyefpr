'use client'

import React from 'react'
import { Users, Building, Activity, Calendar, TrendingUp, Trophy } from 'lucide-react'

export function StatisticsClient({ stats, grading }: { stats: any, grading: any[] }) {
    if (!stats) return null;
    const maxCount = Math.max(...stats.monthlyData.map((d: any) => d.count), 1)

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Top Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Members"
                    value={stats.totalMembers.toLocaleString()}
                    icon={<Users className="w-5 h-5 text-blue-600" />}
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Total Activities"
                    value={stats.totalActivities}
                    icon={<Calendar className="w-5 h-5 text-green-600" />}
                    bgColor="bg-green-50"
                />
                <StatCard
                    title="Total Cells"
                    value={stats.totalCells}
                    icon={<Building className="w-5 h-5 text-purple-600" />}
                    bgColor="bg-purple-50"
                />
                <StatCard
                    title="Total Villages"
                    value={stats.totalVillages}
                    icon={<Activity className="w-5 h-5 text-red-600" />}
                    bgColor="bg-red-50"
                />
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Monthly Activity Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Activity Participation Trends</h3>
                            <p className="text-sm text-slate-500">Event volume over the last 6 months</p>
                        </div>
                        <div className="p-3 bg-primary/5 rounded-2xl">
                            <TrendingUp className="w-6 h-6 text-primary" />
                        </div>
                    </div>

                    <div className="relative h-64 w-full flex items-end justify-between gap-4 mt-12 pb-8">
                        {stats.monthlyData.map((data: any, i: number) => {
                            const height = (data.count / maxCount) * 100
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center group">
                                    <div className="relative w-full flex flex-col items-center">
                                        <div
                                            className="w-full max-w-[40px] bg-gradient-to-t from-primary to-primary/80 rounded-t-lg transition-all duration-500 group-hover:from-primary/90 group-hover:to-primary"
                                            style={{ height: `${height}%`, minHeight: '4px' }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none font-bold">
                                                {data.count} Activities
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-wider">{data.month}</span>
                                </div>
                            )
                        })}
                        {/* Horizontal lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                            {[0, 1, 2, 3].map(i => <div key={i} className="border-t border-slate-900 w-full" />)}
                        </div>
                    </div>
                </div>

                {/* Village Performance Summary */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl text-white shadow-xl flex flex-col">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                            <Trophy className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Top Performing Village</h3>
                            <p className="text-sm text-slate-400">Excellence in mobilization</p>
                        </div>
                    </div>

                    {grading.length > 0 ? (
                        <div className="flex-1 flex flex-col justify-center text-center">
                            <span className="text-5xl font-black mb-2 tracking-tight">{grading[0].name}</span>
                            <div className="inline-flex items-center justify-center gap-2 bg-yellow-400/20 text-yellow-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-yellow-400/20 mx-auto">
                                <Trophy className="w-3 h-3" /> Grade {grading[0].grade}
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/5 space-y-4 text-left">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Participation Rate</span>
                                    <span className="font-bold">{grading[0].attendanceRate}%</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Total Members</span>
                                    <span className="font-bold">{grading[0].memberCount}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-500 italic">No grading data available</div>
                    )}
                </div>
            </div>

            {/* Comprehensive Village Grading Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-8">
                <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800">Village Performance Grading</h3>
                    <p className="text-sm text-slate-500">Benchmark based on enrollment and mobilization metrics</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 text-[10px] uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50">
                                <th className="px-8 py-4 font-black">Rank</th>
                                <th className="px-8 py-4 font-black">Village Name</th>
                                <th className="px-8 py-4 font-black">Members</th>
                                <th className="px-8 py-4 font-black">Participation Rate</th>
                                <th className="px-8 py-4 font-black text-center">Grade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {grading.map((v, i) => (
                                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            i === 1 ? 'bg-slate-100 text-slate-600' :
                                                i === 2 ? 'bg-orange-100 text-orange-700' :
                                                    'bg-white border border-slate-100 text-slate-400'
                                            }`}>
                                            {i + 1}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-slate-700">{v.name}</td>
                                    <td className="px-8 py-5 text-slate-500 text-sm">{v.memberCount}</td>
                                    <td className="px-8 py-5 font-bold text-slate-800 text-sm">{v.attendanceRate}%</td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`inline-block px-3 py-1 rounded text-xs font-black ${v.grade === 'A' ? 'bg-green-100 text-green-700' :
                                            v.grade === 'B' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-primary'
                                            }`}>
                                            {v.grade}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, bgColor }: { title: string, value: string | number, icon: React.ReactNode, bgColor: string }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
                </div>
                <div className={`p-4 ${bgColor} rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}
