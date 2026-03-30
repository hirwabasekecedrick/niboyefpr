'use client'

import { useState, useEffect, useTransition } from 'react'
import { getMembersForAdmin } from '@/app/actions/cell-admin'
import { getVillageMembers, verifyMember, registerMember, updateMemberStatus } from '@/app/actions/village-leader'
import { Users, CheckCircle, Clock, ShieldAlert, Loader2, Plus, Copy, Edit2 } from 'lucide-react'

export default function MemberManagementClient({
    cellId, sectorId, villageId, currentUserRole
}: {
    cellId?: string, sectorId?: string, villageId?: string, currentUserRole: string
}) {
    const [members, setMembers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [actionStatus, setActionStatus] = useState<{ id: string, status: 'verifying' | 'success' | 'error' | 'updating' } | null>(null)
    const [selectedVillageId, setSelectedVillageId] = useState<string>('all')

    // Registration Modal States
    const [isRegModalOpen, setIsRegModalOpen] = useState(false)
    const [regName, setRegName] = useState('')
    const [regId, setRegId] = useState('')
    const [regPhone, setRegPhone] = useState('')
    const [regRole, setRegRole] = useState('MEMBER')
    const [isRegistering, setIsRegistering] = useState(false)
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)

    // Verification Roles
    const [verifyRoles, setVerifyRoles] = useState<Record<string, string>>({})

    useEffect(() => {
        loadMembers()
    }, [cellId, sectorId, villageId, currentUserRole])

    async function loadMembers() {
        setLoading(true)
        let data = []
        if (currentUserRole === 'VILLAGE_LEADER' && villageId) {
            data = await getVillageMembers(villageId)
            // format identically for the UI
            data = data.map(m => ({ ...m, village: { id: villageId, name: 'Your Village' } }))
        } else {
            data = await getMembersForAdmin(cellId, sectorId)
        }
        setMembers(data)
        setLoading(false)
    }

    async function handleVerify(userId: string) {
        setActionStatus({ id: userId, status: 'verifying' })
        const assignedRole = verifyRoles[userId] || 'MEMBER'

        startTransition(async () => {
            const result = await verifyMember(userId, assignedRole)
            if (result.success) {
                setActionStatus({ id: userId, status: 'success' })
                setMembers(prev => prev.map(m => m.id === userId ? { ...m, isVerified: true, role: assignedRole } : m))
            } else {
                setActionStatus({ id: userId, status: 'error' })
                alert(result.error)
            }
            setTimeout(() => setActionStatus(null), 2000)
        })
    }

    async function handleStatusChange(userId: string, newStatus: string) {
        setActionStatus({ id: userId, status: 'updating' })
        startTransition(async () => {
            const result = await updateMemberStatus(userId, newStatus)
            if (result.success) {
                setMembers(prev => prev.map(m => m.id === userId ? { ...m, status: newStatus } : m))
            } else {
                alert(result.error)
            }
            setActionStatus(null)
        })
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        if (regId.length !== 16) {
            alert('National ID must be exactly 16 characters.')
            return
        }
        if (!villageId || !cellId || !sectorId) {
            alert('Missing jurisdiction context.')
            return
        }

        setIsRegistering(true)
        try {
            const res = await registerMember({
                name: regName,
                nationalId: regId,
                phone: regPhone,
                villageId,
                cellId,
                sectorId,
                role: regRole
            })

            if (res.success && res.data) {
                setGeneratedPassword(res.defaultPassword || null)
                setMembers(prev => [...prev, {
                    ...res.data,
                    village: { id: villageId, name: 'Your Village' },
                }])
            } else {
                alert(res.error || 'Failed to register member')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsRegistering(false)
        }
    }

    function resetRegModal() {
        setIsRegModalOpen(false)
        setRegName('')
        setRegId('')
        setRegPhone('')
        setRegRole('MEMBER')
        setGeneratedPassword(null)
    }

    const uniqueVillages = Array.from(new Map(members.filter(m => m.village).map(m => [m.village?.id, m.village])).values()) as { id: string, name: string }[];
    const filteredByVillage = members.filter(m => selectedVillageId === 'all' || m.villageId === selectedVillageId);

    const pendingMembers = filteredByVillage.filter(m => !m.isVerified && !m.isVacant)

    const verifiedOnly = filteredByVillage.filter(m => m.isVerified && !m.isVacant)
    let verifiedMembers = [...verifiedOnly]

    const roleOrder = ['VILLAGE_LEADER', 'VICE_VILLAGE_LEADER', 'SECRETARY', 'DISCIPLINE_COMMITTEE', 'INSPECTION_COMMITTEE', 'MEMBER']
    const requiredRoles = ['VILLAGE_LEADER', 'VICE_VILLAGE_LEADER', 'SECRETARY', 'DISCIPLINE_COMMITTEE', 'INSPECTION_COMMITTEE']

    verifiedMembers.sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role))

    if ((currentUserRole === 'VILLAGE_LEADER' && villageId) || selectedVillageId !== 'all') {
        const currentRoles = new Set(verifiedMembers.map(m => m.role))
        requiredRoles.forEach(rr => {
            if (!currentRoles.has(rr)) {
                verifiedMembers.push({
                    id: `vacant-${rr}`,
                    name: 'Vacant',
                    role: rr,
                    isVacant: true,
                    status: 'VACANT',
                    nationalId: '-',
                    phone: '-'
                })
            }
        })
        verifiedMembers.sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role))
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-transparent gap-4 flex-wrap">
                {uniqueVillages.length > 1 ? (
                    <select
                        value={selectedVillageId}
                        onChange={(e) => setSelectedVillageId(e.target.value)}
                        className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:ring-primary focus:border-primary text-slate-700 bg-white"
                    >
                        <option value="all">All Villages</option>
                        {uniqueVillages.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>
                ) : <div />}

                {currentUserRole === 'VILLAGE_LEADER' && (
                    <button
                        onClick={() => setIsRegModalOpen(true)}
                        className="bg-primary text-white flex gap-2 items-center px-4 py-2 rounded-md font-medium text-sm transition-colors hover:bg-primary/90 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Register New Member
                    </button>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 rounded-full">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Members</p>
                        <h3 className="text-2xl font-bold text-slate-800">{filteredByVillage.length}</h3>
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
                        <h3 className="text-2xl font-bold text-slate-800">{verifiedOnly.length}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
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
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                                        {member.profilePicture ? (
                                            <img src={member.profilePicture} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Users className="w-6 h-6 text-slate-300" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{member.name}</h3>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-4 text-sm text-slate-500 mt-2">
                                            <span>ID: {member.nationalId}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span>Phone: {member.phone}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span>Village: {member.village?.name || 'N/A'}</span>

                                            {currentUserRole === 'VILLAGE_LEADER' && (
                                                <>
                                                    <span className="hidden sm:inline">•</span>
                                                    <select
                                                        value={verifyRoles[member.id] || 'MEMBER'}
                                                        onChange={(e) => setVerifyRoles({ ...verifyRoles, [member.id]: e.target.value })}
                                                        className="px-2 py-1 text-xs border rounded-md font-medium text-slate-700 bg-white"
                                                    >
                                                        <option value="MEMBER">Member</option>
                                                        {((currentUserRole as any) === 'CELL_ADMIN' || (currentUserRole as any) === 'SECTOR_ADMIN') && (
                                                            <option value="VILLAGE_LEADER">Village Leader</option>
                                                        )}
                                                        <option value="VICE_VILLAGE_LEADER">Vice Village Leader</option>
                                                        <option value="SECRETARY">Secretary</option>
                                                        <option value="DISCIPLINE_COMMITTEE">Discipline Committee</option>
                                                        <option value="INSPECTION_COMMITTEE">Inspection Committee</option>
                                                    </select>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {currentUserRole === 'VILLAGE_LEADER' && (
                                    <button
                                        onClick={() => handleVerify(member.id)}
                                        disabled={actionStatus?.id === member.id}
                                        className="flex-shrink-0 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto text-center flex justify-center items-center gap-2"
                                    >
                                        {actionStatus?.id === member.id ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                                        ) : (
                                            'Verify & Assign Role'
                                        )}
                                    </button>
                                )}
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
                                    <th className="px-6 py-3 font-medium">Avatar</th>
                                    <th className="px-6 py-3 font-medium">Name</th>
                                    <th className="px-6 py-3 font-medium">National ID</th>
                                    <th className="px-6 py-3 font-medium">Phone</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {verifiedMembers.map(member => (
                                    <tr key={member.id} className={`hover:bg-slate-50/50 transition-colors text-sm ${member.isVacant ? 'bg-slate-50 opacity-70' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border shadow-sm ${member.isVacant ? 'bg-slate-100 border-slate-200' : 'bg-red-50 border-red-100'}`}>
                                                {member.profilePicture ? (
                                                    <img src={member.profilePicture} alt={member.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Users className={`w-4 h-4 ${member.isVacant ? 'text-slate-300' : 'text-primary'}`} />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800 flex flex-col items-start gap-1">
                                                <span>{member.name}</span>
                                                {member.role !== 'MEMBER' && (
                                                    <span className="text-[10px] uppercase font-bold text-primary bg-red-50 px-2 py-0.5 rounded w-max">
                                                        {member.role.replace(/_/g, ' ')}
                                                    </span>
                                                )}
                                            </div>
                                            {currentUserRole !== 'VILLAGE_LEADER' && member.village && (
                                                <div className="text-xs text-slate-500 font-normal mt-1">{member.village.name}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{member.nationalId}</td>
                                        <td className="px-6 py-4 text-slate-600">{member.phone}</td>
                                        <td className="px-6 py-4">
                                            {member.isVacant ? (
                                                <span className="text-slate-400 italic text-xs">Unfilled</span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {currentUserRole === 'VILLAGE_LEADER' ? (
                                                        <select
                                                            value={member.status || 'ACTIVE'}
                                                            onChange={(e) => handleStatusChange(member.id, e.target.value)}
                                                            disabled={actionStatus?.id === member.id}
                                                            className={`text-xs px-2.5 py-1 rounded-full font-semibold outline-none border-none shadow-sm cursor-pointer
                                                                ${member.status === 'ACTIVE' || !member.status ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'}`}
                                                        >
                                                            <option value="ACTIVE">Active</option>
                                                            <option value="MOVED">Moved</option>
                                                            <option value="DECEASED">Deceased</option>
                                                            <option value="SUSPENDED">Suspended</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                                                            ${member.status === 'ACTIVE' || !member.status ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'}`}>
                                                            {member.status || 'ACTIVE'}
                                                        </span>
                                                    )}
                                                    {actionStatus?.id === member.id && actionStatus?.status === 'updating' && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Registration Modal */}
            {isRegModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800">Register New Member</h2>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {!generatedPassword ? (
                                <form id="regForm" onSubmit={handleRegister} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                        <input type="text" required value={regName} onChange={e => setRegName(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">National ID (16 digits)</label>
                                        <input type="text" required maxLength={16} minLength={16} value={regId} onChange={e => setRegId(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                        <input type="tel" required value={regPhone} onChange={e => setRegPhone(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                        <select value={regRole} onChange={e => setRegRole(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all outline-none">
                                            <option value="MEMBER">Member</option>
                                            {((currentUserRole as any) === 'CELL_ADMIN' || (currentUserRole as any) === 'SECTOR_ADMIN') && (
                                                <option value="VILLAGE_LEADER">Village Leader</option>
                                            )}
                                            <option value="VICE_VILLAGE_LEADER">Vice Village Leader</option>
                                            <option value="SECRETARY">Secretary</option>
                                            <option value="DISCIPLINE_COMMITTEE">Discipline Committee</option>
                                            <option value="INSPECTION_COMMITTEE">Inspection Committee</option>
                                        </select>
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center space-y-4 py-4">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">Registration Successful!</h3>
                                    <p className="text-sm text-slate-500">The member has been added and verified. Please share their login password below:</p>

                                    <div className="mt-4 p-4 bg-slate-100 rounded-xl border border-slate-200 relative group">
                                        <p className="text-sm text-slate-500 font-medium mb-1">Temporary Password</p>
                                        <p className="text-xl font-mono font-bold text-slate-800 tracking-wider">
                                            {generatedPassword}
                                        </p>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(generatedPassword)}
                                            className="absolute top-4 right-4 p-2 bg-white rounded-lg border shadow-sm text-slate-500 hover:text-primary transition-colors focus:ring-2 focus:ring-primary/50"
                                            title="Copy to clipboard"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">The member should change this password upon their first login.</p>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={resetRegModal}
                                className="px-4 py-2 border rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                {generatedPassword ? 'Close' : 'Cancel'}
                            </button>
                            {!generatedPassword && (
                                <button
                                    form="regForm"
                                    type="submit"
                                    disabled={isRegistering}
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                >
                                    {isRegistering ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</> : 'Complete Registration'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
