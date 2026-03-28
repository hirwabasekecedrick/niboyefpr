'use client'

import { Trophy, ChevronDown, ChevronRight, Users } from 'lucide-react'
import { useState } from 'react'
import VillageMembersModal from '@/components/dashboard/VillageMembersModal'

export function CellPerformanceStats({ performance }: { performance: any[] }) {
    const maxAttendance = Math.max(...performance.map(p => p.attendanceCount), 1)
    const [expandedCells, setExpandedCells] = useState<Record<string, boolean>>({})

    const [selectedVillageId, setSelectedVillageId] = useState<string | null>(null)
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)

    const toggleCell = (id: string) => {
        setExpandedCells(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const handleVillageClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedVillageId(id)
        setIsMembersModalOpen(true)
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-red-50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Overall Cells Ranking
                </h2>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-slate-200 px-2 py-0.5 rounded">
                    Participation Marks
                </span>
            </div>

            <div className="p-6 space-y-6">
                {performance.map((cell, index) => (
                    <div key={cell.id} className="space-y-2 border border-slate-100 rounded-xl p-4 transition-all hover:border-slate-200">
                        <div
                            className="flex justify-between items-center text-sm cursor-pointer"
                            onClick={() => toggleCell(cell.id)}
                        >
                            <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${index === 0 ? 'bg-yellow-101 text-yellow-700' :
                                    index === 1 ? 'bg-slate-100 text-slate-600' :
                                        index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'
                                    }`}>
                                    #{index + 1}
                                </span>
                                <span className="font-bold text-slate-800 text-base flex-1">{cell.name} Cell</span>
                                {expandedCells[cell.id] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="font-bold text-primary">{cell.attendanceCount} Marks</span>
                                <span className="text-xs text-slate-500">{cell.memberCount} Members</span>
                            </div>
                        </div>
                        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                            <div
                                className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
                                style={{ width: `${(cell.attendanceCount / maxAttendance) * 100}%` }}
                            />
                        </div>

                        {/* Villages Expansion */}
                        {expandedCells[cell.id] && (
                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 pl-8">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Villages Participation</h4>
                                {cell.villages.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">No villages registered.</p>
                                ) : (
                                    cell.villages.map((village: any) => (
                                        <div
                                            key={village.id}
                                            onClick={(e) => handleVillageClick(village.id, e)}
                                            className="flex justify-between items-center bg-slate-50 hover:bg-slate-100 p-2 rounded-md cursor-pointer transition-colors group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">
                                                    {village.name}
                                                </span>
                                                {village.isOnline && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title="Admin is Online"></div>
                                                )}
                                            </div>
                                            <div className="text-right text-xs">
                                                <span className="font-semibold text-slate-800 group-hover:text-primary transition-colors">
                                                    {village.attendanceCount} Marks
                                                </span>
                                                <span className="text-slate-500 ml-2">({village.memberCount} members)</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {performance.length === 0 && (
                    <p className="text-center text-slate-400 text-sm py-4 italic">No performance data available yet.</p>
                )}
            </div>

            <VillageMembersModal
                villageId={selectedVillageId}
                isOpen={isMembersModalOpen}
                onClose={() => setIsMembersModalOpen(false)}
            />
        </div>
    )
}
