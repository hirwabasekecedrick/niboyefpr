'use client'

import { useState, useTransition, useEffect } from 'react'
import { markAttendance, confirmAttendance, searchMembersForActivity } from '@/app/actions/activities'
import { Check, X, Minus, Loader2, User, Search, Users, Pencil, Save, AlertCircle, Info } from 'lucide-react'

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
    const [attendances, setAttendances] = useState<Record<string, { status: 'PRESENT' | 'ABSENT' | 'EXCUSED', isConfirmed: boolean, id?: string, excusedReason?: string }>>(
        Object.fromEntries(initialAttendances.map(a => [a.userId, { status: a.status, isConfirmed: a.isConfirmed, id: a.id, excusedReason: a.excusedReason }]))
    )
    const [members, setMembers] = useState<any[]>(initialMembers)
    const [excusingId, setExcusingId] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [excuseReason, setExcuseReason] = useState('')

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

        if (newStatus === 'EXCUSED') {
            setExcusingId(userId)
            setExcuseReason('')
            return
        }

        executeToggle(userData, newStatus)
    }

    const executeToggle = (userData: any, newStatus: 'PRESENT' | 'ABSENT' | 'EXCUSED', reason?: string) => {
        const userId = userData.id

        startTransition(async () => {
            // Manual marks by a leader are always confirmed
            const res = await markAttendance(activityId, newStatus, userId, false, reason)
            if (res.success) {
                setAttendances(prev => ({
                    ...prev,
                    [userId]: { status: newStatus, isConfirmed: true, excusedReason: reason }
                }))
                // Clear UI states
                setExcusingId(null)
                setEditingId(null)
                setExcuseReason('')

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
                    members.map((member: any) => (
                        <div key={member.id} className="p-4 flex flex-col hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 overflow-hidden shadow-sm shrink-0 ${attendances[member.id]?.status === 'PRESENT' ? 'border-green-100 bg-green-50' :
                                        attendances[member.id]?.status === 'ABSENT' ? 'border-red-100 bg-red-50' :
                                            attendances[member.id]?.status === 'EXCUSED' ? 'border-blue-100 bg-blue-50' :
                                                'border-slate-100 bg-slate-50'
                                        }`}>
                                        {member.profilePicture ? (
                                            <img src={member.profilePicture} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className={`w-5 h-5 ${attendances[member.id]?.status === 'PRESENT' ? 'text-green-600' :
                                                attendances[member.id]?.status === 'ABSENT' ? 'text-primary' :
                                                    attendances[member.id]?.status === 'EXCUSED' ? 'text-blue-600' :
                                                        'text-slate-300'
                                                }`} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{member.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[10px] text-slate-400 font-mono tracking-tighter">{member.nationalId}</p>
                                            {attendances[member.id] && (
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm flex items-center gap-1
                                                ${attendances[member.id].status === 'PRESENT' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        attendances[member.id].status === 'ABSENT' ? 'bg-red-50 text-primary border-red-100' :
                                                            'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                    {attendances[member.id].status === 'PRESENT' && <Check className="w-2 h-2" />}
                                                    {attendances[member.id].status === 'ABSENT' && <X className="w-2 h-2" />}
                                                    {attendances[member.id].status === 'EXCUSED' && <Minus className="w-2 h-2" />}
                                                    {attendances[member.id].status}
                                                </span>
                                            )}
                                            {attendances[member.id]?.status === 'PRESENT' && !attendances[member.id]?.isConfirmed && (
                                                <span className="text-[8px] font-bold text-yellow-600 bg-yellow-50 px-1 rounded uppercase border border-yellow-200">Pending</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {attendances[member.id] && editingId !== member.id ? (
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
                                            <button
                                                onClick={() => setEditingId(member.id)}
                                                className="p-1.5 text-slate-400 hover:text-primary hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100 shadow-sm"
                                                title="Edit Attendance"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex bg-slate-100 p-1 rounded-lg shadow-inner">
                                            <button
                                                onClick={() => executeToggle(member, 'PRESENT')}
                                                className="px-3 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors border border-green-200 flex items-center gap-1.5 text-[11px] font-bold"
                                            >
                                                <Check className="w-3 h-3" />
                                                Present
                                            </button>
                                            <button
                                                onClick={() => executeToggle(member, 'ABSENT')}
                                                className="px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors border border-red-200 flex items-center gap-1.5 text-[11px] font-bold"
                                            >
                                                <X className="w-3 h-3" />
                                                Absent
                                            </button>
                                            <button
                                                onClick={() => handleToggle(member, 'EXCUSED')}
                                                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors border border-blue-200 flex items-center gap-1.5 text-[11px] font-bold"
                                            >
                                                <Minus className="w-3 h-3" />
                                                Excused
                                            </button>
                                            {editingId === member.id && (
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="ml-1 px-2 py-1 text-slate-400 hover:text-slate-600 font-medium text-[11px]"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Excuse Reason Input Area */}
                            {excusingId === member.id && (
                                <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Why is this member excused?
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            autoFocus
                                            value={excuseReason}
                                            onChange={(e) => setExcuseReason(e.target.value)}
                                            placeholder="e.g. Travel, Illness, Family commitment..."
                                            className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') executeToggle(member, 'EXCUSED', excuseReason)
                                                if (e.key === 'Escape') setExcusingId(null)
                                            }}
                                        />
                                        <button
                                            onClick={() => executeToggle(member, 'EXCUSED', excuseReason)}
                                            disabled={!excuseReason.trim() || isPending}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setExcusingId(null)}
                                            className="px-3 py-1.5 text-slate-400 hover:text-slate-600 text-sm font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Existing Reason Display */}
                            {attendances[member.id]?.status === 'EXCUSED' && attendances[member.id]?.excusedReason && excusingId !== member.id && (
                                <div className="mt-2 ml-13 flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-md">
                                    <div className="p-1 bg-blue-50 text-blue-400 rounded">
                                        <Info className="w-3 h-3" />
                                    </div>
                                    <p className="text-xs text-slate-500 italic leading-relaxed">
                                        <span className="font-bold text-slate-400 uppercase text-[9px] mr-1 not-italic tracking-tighter">Reason:</span>
                                        {attendances[member.id]?.excusedReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
