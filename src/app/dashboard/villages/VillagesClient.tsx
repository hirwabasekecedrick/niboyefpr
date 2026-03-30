'use client'

import { useState } from 'react'
import { Plus, Users, MapPin, Activity, Building, Loader2 } from 'lucide-react'
import { registerVillage } from '@/app/actions/cell-admin'
import { getCellsForSector, getVillagesWithMetrics, getVillageMembersHierarchical } from '@/app/actions/jurisdiction'
import VillageMembersModal from '@/components/dashboard/VillageMembersModal'
import { useEffect, useTransition } from 'react'
import { Role } from '@prisma/client'

type Village = {
    id: string
    name: string
    cellId: string
    cell: { id: string, name: string }
    _count: { users: number }
    isLeaderOnline?: boolean
    memberCount?: number
}

type Cell = {
    id: string
    name: string
    villageCount: number
    memberCount: number
}

export default function VillagesClient({
    initialVillages,
    cellId: propsCellId,
    sectorId,
    currentUserRole
}: {
    initialVillages: Village[],
    cellId?: string,
    sectorId?: string,
    currentUserRole: string
}) {
    const [villages, setVillages] = useState<Village[]>(initialVillages)
    const [cells, setCells] = useState<Cell[]>([])
    const [selectedCellId, setSelectedCellId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'CELLS' | 'VILLAGES'>(currentUserRole === 'SECTOR_ADMIN' ? 'CELLS' : 'VILLAGES')
    const [loading, setLoading] = useState(false)
    const [isPending, startTransition] = useTransition()

    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formName, setFormName] = useState('')

    const [selectedVillageId, setSelectedVillageId] = useState<string | null>(null)
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)

    useEffect(() => {
        if (currentUserRole === 'SECTOR_ADMIN' && sectorId && viewMode === 'CELLS') {
            loadCells()
        }
    }, [sectorId, viewMode])

    async function loadCells() {
        setLoading(true)
        const data = await getCellsForSector(sectorId!)
        setCells(data)
        setLoading(false)
    }

    async function handleCellClick(cId: string) {
        setLoading(true)
        setSelectedCellId(cId)
        const data = await getVillagesWithMetrics(cId)
        // Adapt back to Village type
        setVillages(data.map(v => ({
            id: v.id,
            name: v.name,
            cellId: cId,
            cell: { id: cId, name: 'Current Cell' },
            _count: { users: v.memberCount },
            isLeaderOnline: v.isLeaderOnline
        } as Village)))
        setViewMode('VILLAGES')
        setLoading(false)
    }

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const targetCellId = currentUserRole === 'SECTOR_ADMIN' ? selectedCellId : propsCellId
        if (!targetCellId) {
            alert('Cannot register village: Unknown Cell ID.')
            return
        }

        setIsSubmitting(true)
        try {
            const res = await registerVillage({
                name: formName,
                cellId: targetCellId
            })

            if (res.success && res.data) {
                // Approximate new village for local state
                setVillages([...villages, { ...res.data, cell: { id: targetCellId, name: 'Current Cell' }, _count: { users: 0 }, isLeaderOnline: false } as Village])
                setIsAddModalOpen(false)
                setFormName('')
            } else {
                alert('Failed to register village: ' + res.error)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleVillageClick = (id: string) => {
        setSelectedVillageId(id)
        setIsMembersModalOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-transparent gap-4">
                <div className="text-sm text-slate-500 font-medium flex items-center gap-2">
                    {viewMode === 'VILLAGES' && currentUserRole === 'SECTOR_ADMIN' && (
                        <button
                            onClick={() => setViewMode('CELLS')}
                            className="text-primary hover:underline font-bold"
                        >
                            &larr; Back to Cells
                        </button>
                    )}
                    {viewMode === 'CELLS' ? 'Select a cell to view its villages.' : 'Click a village to view its members and leadership.'}
                </div>
                {['CELL_ADMIN', 'SECTOR_ADMIN'].includes(currentUserRole) && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        disabled={currentUserRole === 'SECTOR_ADMIN' && viewMode === 'CELLS'}
                        className="flex-shrink-0 flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" />
                        Register New Village
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : viewMode === 'CELLS' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {cells.map(cell => (
                        <div
                            key={cell.id}
                            onClick={() => handleCellClick(cell.id)}
                            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                        >
                            <div className="p-3 bg-red-50 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors w-fit mb-4">
                                <Building className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">{cell.name} Cell</h3>
                            <div className="flex items-center gap-4 mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-primary" />
                                    {cell.villageCount} Villages
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3 text-primary" />
                                    {cell.memberCount} Members
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {villages.length === 0 ? (
                        <div className="col-span-full p-8 text-center text-slate-500 bg-white border rounded-lg shadow-sm">
                            No villages registered in this cell yet.
                        </div>
                    ) : (
                        villages.map(village => (
                            <div
                                key={village.id}
                                onClick={() => handleVillageClick(village.id)}
                                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group relative"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-red-50 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full uppercase tracking-wider">{village.cell?.name || 'Unknown Cell'}</span>
                                </div>

                                <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                                    {village.name}
                                    {village.isLeaderOnline && (
                                        <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-bold border border-green-200" title="Village Leader is Online">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                            Online
                                        </span>
                                    )}
                                </h3>

                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-4 font-medium">
                                    <Users className="w-4 h-4" />
                                    <span>{village._count.users} Verified Members</span>
                                </div>

                                <div className="absolute top-4 bottom-4 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-primary group-hover:bg-red-50">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800">Register New Village</h2>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Village Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all bg-slate-50 focus:bg-white"
                                    placeholder="e.g., Kigarama"
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-sm"
                                >
                                    {isSubmitting ? 'Registering...' : 'Register Village'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <VillageMembersModal
                villageId={selectedVillageId}
                isOpen={isMembersModalOpen}
                onClose={() => setIsMembersModalOpen(false)}
            />
        </div>
    )
}
