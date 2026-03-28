'use client'

import { useState, useTransition, useEffect } from 'react'
import { markAttendance, confirmAttendance, searchMembersForActivity } from '@/app/actions/activities'
import { Check, X, Minus, Loader2, User, Search, Users } from 'lucide-react'

export function AttendanceTracker({
    activityId,
    activityTitle,
    initialMembers = [],
    initialAttendances = [],
    activityLevel = 'VILLAGE',
    cellId,
    sectorId
}: {
    activityId: string,
    activityTitle: string,
    initialMembers: any[],
    initialAttendances?: any[],
    activityLevel?: string,
    cellId?: string | null,
    sectorId?: string | null
}) {
    const [isPending, startTransition] = useTransition()
    const [confirmingId, setConfirmingId] = useState<string | null>(null)
    const [attendances, setAttendances] = useState<Record<string, { status: 'PRESENT' | 'ABSENT' | 'EXCUSED', isConfirmed: boolean, id?: string }>>(
        Object.fromEntries(initialAttendances.map(a => [a.userId, { status: a.status, isConfirmed: a.isConfirmed, id: a.id }]))
    )
    const [members, setMembers] = useState<any[]>(initialMembers)

    // Search State
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)

    // Calculate live stats
    const presentCount = Object.values(attendances).filter(v => v.status === 'PRESENT' && v.isConfirmed).length
    const pendingCount = Object.values(attendances).filter(v => v.status === 'PRESENT' && !v.isConfirmed).length
    const absentCount = Object.values(attendances).filter(v => v.status === 'ABSENT').length
    const excusedCount = Object.values(attendances).filter(v => v.status === 'EXCUSED').length

    useEffect(() => {
        if (searchQuery.length < 3) {
            setSearchResults([])
            return
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true)
            try {
                const results = await searchMembersForActivity(searchQuery, activityLevel, cellId || undefined, sectorId || undefined)
                // Filter out members who are already in our main active list
                setSearchResults(results.filter(r => !members.some(m => m.id === r.id)))
            } catch (e) {
                console.error(e)
            } finally {
                setIsSearching(false)
            }
        }, 400)

        return () => clearTimeout(delayDebounceFn)
    }, [searchQuery, activityLevel, cellId, sectorId, members])

    const handleToggle = (userData: any, newStatus: 'PRESENT' | 'ABSENT' | 'EXCUSED') => {
        const userId = userData.id
        startTransition(async () => {
            // Manual marks by a leader are always confirmed
            const res = await markAttendance(activityId, newStatus, userId, false)
            if (res.success) {
                setAttendances(prev => ({
                    ...prev,
                    [userId]: { status: newStatus, isConfirmed: true }
                }))
                // If member was from search results, promote them to the main register view
                if (!members.some(m => m.id === userId)) {
                    setMembers(prev => [userData, ...prev])
                    setSearchQuery('')
                    setSearchResults([])
                }
            } else {
                alert(res.error || 'Failed to update attendance')
            }
        })
    }

    const handleConfirm = (userId: string) => {
        const attendance = attendances[userId];
        if (!attendance || !attendance.id) return;

        setConfirmingId(userId);
        startTransition(async () => {
            const res = await confirmAttendance(attendance.id!)
            if (res.success) {
                setAttendances(prev => ({
                    ...prev,
                    [userId]: { ...prev[userId], isConfirmed: true }
                }))
            } else {
                alert(res.error || 'Failed to confirm attendance')
            }
            setConfirmingId(null);
        })
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-red-50 overflow-hidden flex flex-col max-h-[800px]">
            {/* Header & Stats */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800">{activityTitle}</h3>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Live Digital Register</p>
                    </div>
                    {isPending && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white border border-slate-200 rounded-lg p-2 px-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Present</span>
                        <span className="font-black text-green-600">{presentCount}</span>
                    </div>
                    <div className="bg-white border border-yellow-200 rounded-lg p-2 px-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-yellow-500 uppercase">Pending</span>
                        <span className="font-black text-yellow-600">{pendingCount}</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-2 px-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Absent</span>
                        <span className="font-black text-primary">{absentCount}</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-2 px-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Excused</span>
                        <span className="font-black text-blue-600">{excusedCount}</span>
                    </div>
                </div>

                {/* Add Member Search */}
                <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search any member by name or National ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                    />
                    {isSearching && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        </div>
                    )}
                </div>
            </div>

            {/* Main List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50 bg-white">
                {/* Search Results Display */}
                {searchResults.length > 0 && (
                    <div className="bg-slate-50 border-b border-slate-100">
                        <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase bg-slate-100/50">Search Results</div>
                        {searchResults.map(member => (
                            <div key={`search-${member.id}`} className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center border bg-slate-50 border-slate-200 text-slate-400">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{member.name}</p>
                                        <p className="text-[10px] text-slate-400 font-mono tracking-tighter">{member.nationalId}</p>
                                    </div>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                                    <button
                                        onClick={() => handleToggle(member, 'PRESENT')}
                                        className="px-2 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors border border-green-200 text-[10px] font-bold"
                                    >
                                        Mark Present
                                    </button>
                                    <button
                                        onClick={() => handleToggle(member, 'ABSENT')}
                                        className="px-2 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors border border-red-200 text-[10px] font-bold"
                                    >
                                        Mark Absent
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Expected Attendees */}
                {members.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        No expected attendees yet. Use the search to mark attendance for unregistered members.
                    </div>
                ) : (
                    members.map((member) => (
                        <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${attendances[member.id]?.status === 'PRESENT' ? 'bg-green-50 border-green-200 text-green-600' :
                                    attendances[member.id]?.status === 'ABSENT' ? 'bg-red-50 border-red-200 text-primary' :
                                        attendances[member.id]?.status === 'EXCUSED' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                                            'bg-slate-50 border-slate-200 text-slate-400'
                                    }`}>
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">{member.name}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] text-slate-400 font-mono tracking-tighter">{member.nationalId}</p>
                                        {attendances[member.id]?.status === 'PRESENT' && !attendances[member.id]?.isConfirmed && (
                                            <span className="text-[8px] font-bold text-yellow-600 bg-yellow-50 px-1 rounded uppercase border border-yellow-200">Pending</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {attendances[member.id]?.status === 'PRESENT' && !attendances[member.id]?.isConfirmed && (
                                    <button
                                        onClick={() => handleConfirm(member.id)}
                                        disabled={confirmingId === member.id}
                                        className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm transition-all disabled:opacity-50"
                                    >
                                        {confirmingId === member.id ? '...' : 'Confirm'}
                                    </button>
                                )}
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => handleToggle(member, 'PRESENT')}
                                        className="px-3 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors border border-green-200"
                                        title="Confirmed Present"
                                    >
                                        Mark Present
                                    </button>
                                    <button
                                        onClick={() => handleToggle(member, 'ABSENT')}
                                        className="px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors border border-red-200"
                                        title="Confirmed Absent"
                                    >
                                        Mark Absent
                                    </button>
                                    <button
                                        onClick={() => handleToggle(member, 'EXCUSED')}
                                        className="px-3 py-1 bg-slate-50 text-slate-700 rounded-md hover:bg-slate-100 transition-colors border border-slate-200"
                                        title="Confirmed Excused"
                                    >
                                        Mark Excused
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
