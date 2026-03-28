'use client'

import { useState } from 'react'
import { Plus, Search, Trash2, Edit } from 'lucide-react'
import { createContribution, deleteContribution, findMemberByNationalId } from '@/app/actions/contributions'

type Contribution = {
    id: string
    amount: number
    date: Date
    memberId: string
    recordedById: string
    level: string
    description: string | null
    member: { id: string, name: string, nationalId: string }
    recordedBy: { id: string, name: string }
}

export default function ContributionsClient({ initialContributions, currentUserRole, currentUserId }: { initialContributions: Contribution[], currentUserRole: string, currentUserId: string }) {
    const [contributions, setContributions] = useState<Contribution[]>(initialContributions)
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [lookupError, setLookupError] = useState('')
    const [foundMember, setFoundMember] = useState<{ id: string, name: string, nationalId: string } | null>(null)

    // Form states
    const [formNationalId, setFormNationalId] = useState('')
    const [formAmount, setFormAmount] = useState('')
    const [formDescription, setFormDescription] = useState('')
    const [formLevel, setFormLevel] = useState(
        currentUserRole === 'SECTOR_ADMIN' ? 'SECTOR' :
            currentUserRole === 'VILLAGE_LEADER' ? 'VILLAGE' : 'CELL'
    )
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])

    const filteredContributions = contributions.filter(c =>
        c.member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.member.nationalId.includes(searchQuery)
    )

    const handleLookup = async () => {
        setLookupError('')
        setFoundMember(null)
        if (formNationalId.length !== 16) {
            setLookupError('National ID must be 16 characters')
            return
        }

        const member = await findMemberByNationalId(formNationalId)
        if (member) {
            setFoundMember(member)
        } else {
            setLookupError('Member not found')
        }
    }

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!foundMember) return

        setIsSubmitting(true)
        try {
            const res = await createContribution({
                amount: parseFloat(formAmount),
                memberId: foundMember.id,
                level: formLevel as "VILLAGE" | "CELL" | "SECTOR",
                description: formDescription,
                date: new Date(formDate)
            })

            if (res.success && res.data) {
                // Prepend to list
                setContributions([{
                    ...res.data,
                    member: foundMember,
                    recordedBy: { id: currentUserId, name: 'You' }
                } as unknown as Contribution, ...contributions])
                setIsAddModalOpen(false)
                resetForm()
            } else {
                alert('Failed to add contribution: ' + res.error)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setFormNationalId('')
        setFormAmount('')
        setFormDescription('')
        setFormLevel(currentUserRole === 'SECTOR_ADMIN' ? 'SECTOR' : 'CELL')
        setFormDate(new Date().toISOString().split('T')[0])
        setFoundMember(null)
        setLookupError('')
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this contribution?')) return
        const res = await deleteContribution(id)
        if (res.success) {
            setContributions(contributions.filter(c => c.id !== id))
        } else {
            alert('Failed to delete: ' + res.error)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 border rounded-md w-full sm:w-80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                {currentUserRole === 'VILLAGE_LEADER' && (
                    <button
                        onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Record Contribution
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b text-slate-600 font-medium">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Member</th>
                            <th className="px-4 py-3">Amount (RWF)</th>
                            <th className="px-4 py-3">Level</th>
                            <th className="px-4 py-3 md:table-cell hidden">Description</th>
                            <th className="px-4 py-3 md:table-cell hidden">Recorded By</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContributions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                    No contributions found.
                                </td>
                            </tr>
                        ) : (
                            filteredContributions.map(c => (
                                <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                    <td className="px-4 py-3">{new Date(c.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-800">{c.member.name}</div>
                                        <div className="text-xs text-slate-500">{c.member.nationalId}</div>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-green-600">
                                        {c.amount.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                            {c.level}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 md:table-cell hidden truncate max-w-[200px]">
                                        {c.description || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 md:table-cell hidden">
                                        {c.recordedBy.name}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {(currentUserRole === 'VILLAGE_LEADER' || currentUserRole === 'SECTOR_ADMIN') && (
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold mb-4 text-slate-800">Record New Contribution</h2>

                        {!foundMember ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Member National ID
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formNationalId}
                                            onChange={(e) => setFormNationalId(e.target.value)}
                                            className="flex-1 p-2 border rounded-md text-sm"
                                            placeholder="16-digit ID"
                                            maxLength={16}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleLookup}
                                            className="bg-slate-100 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-200"
                                        >
                                            Lookup
                                        </button>
                                    </div>
                                    {lookupError && <p className="text-red-500 text-xs mt-1">{lookupError}</p>}
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-4 py-2 border rounded-md hover:bg-slate-50 text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleAddSubmit} className="space-y-4">
                                <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                                    Recording for: <strong>{foundMember.name}</strong> ({foundMember.nationalId})
                                    <button
                                        type="button"
                                        onClick={() => setFoundMember(null)}
                                        className="ml-2 text-blue-600 underline text-xs"
                                    >
                                        Change
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount (RWF)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="100"
                                        value={formAmount}
                                        onChange={(e) => setFormAmount(e.target.value)}
                                        className="w-full p-2 border rounded-md text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                                    <select
                                        value={formLevel}
                                        onChange={(e) => setFormLevel(e.target.value)}
                                        className="w-full p-2 border rounded-md text-sm"
                                    >
                                        <option value="CELL">Cell</option>
                                        <option value="SECTOR">Sector</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formDate}
                                        onChange={(e) => setFormDate(e.target.value)}
                                        className="w-full p-2 border rounded-md text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                                    <textarea
                                        value={formDescription}
                                        onChange={(e) => setFormDescription(e.target.value)}
                                        className="w-full p-2 border rounded-md text-sm"
                                        rows={2}
                                    />
                                </div>

                                <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-4 py-2 border rounded-md hover:bg-slate-50 text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm font-medium disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Record Contribution'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
