'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, User, CreditCard, Phone, Lock, MapPin, Building, Flag, Loader2 } from 'lucide-react'
import { getSectors, getCellsBySector, getVillagesByCell, registerMember } from '@/app/actions/member'

export default function RegisterPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [sectors, setSectors] = useState<any[]>([])
    const [cells, setCells] = useState<any[]>([])
    const [villages, setVillages] = useState<any[]>([])

    const [selectedSector, setSelectedSector] = useState('')
    const [selectedCell, setSelectedCell] = useState('')
    const [selectedVillage, setSelectedVillage] = useState('')

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        getSectors().then(data => setSectors(data))
    }, [])

    useEffect(() => {
        if (selectedSector) {
            getCellsBySector(selectedSector).then(data => setCells(data))
            setSelectedCell('')
            setVillages([])
        }
    }, [selectedSector])

    useEffect(() => {
        if (selectedCell) {
            getVillagesByCell(selectedCell).then(data => setVillages(data))
            setSelectedVillage('')
        }
    }, [selectedCell])

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setSuccess('')

        const formData = new FormData(e.currentTarget)
        formData.append('sectorId', selectedSector)
        formData.append('cellId', selectedCell)
        formData.append('villageId', selectedVillage)

        startTransition(async () => {
            const result = await registerMember(formData)
            if (!result.success) {
                setError(result.error || 'Unknown error occurred.')
            } else {
                setSuccess('Registration successful! Redirecting to dashboard...')
                setTimeout(() => {
                    router.push('/dashboard')
                }, 2000)
            }
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
                <div className="bg-primary px-8 py-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative z-10 flex flex-col items-center">
                        <ShieldCheck className="h-12 w-12 text-white mb-2" />
                        <h1 className="text-2xl font-bold text-white tracking-tight">Niboye Sector Registration</h1>
                        <p className="text-red-100 mt-2 text-sm">Join the FPR Inkotanyi Management System</p>
                    </div>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-primary p-4 rounded-r-md">
                            <p className="text-sm font-medium text-primary">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md">
                            <p className="text-sm font-medium text-green-700">{success}</p>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <User className="w-4 h-4 text-primary" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    placeholder="e.g. Jean Damascene"
                                    className="w-full h-11 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                                />
                            </div>

                            {/* National ID */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-primary" /> National ID
                                </label>
                                <input
                                    type="text"
                                    name="nationalId"
                                    required
                                    placeholder="16-digit ID number"
                                    pattern="\d{16}"
                                    title="Please enter exactly 16 digits"
                                    className="w-full h-11 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-primary" /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    placeholder="07..."
                                    className="w-full h-11 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-primary" /> Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="Create a password"
                                    className="w-full h-11 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Location Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                {/* Sector */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Flag className="w-4 h-4 text-primary" /> Sector
                                    </label>
                                    <select
                                        required
                                        value={selectedSector}
                                        onChange={(e) => setSelectedSector(e.target.value)}
                                        className="w-full h-11 px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                                    >
                                        <option value="" disabled>Select Sector</option>
                                        {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>

                                {/* Cell */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Building className="w-4 h-4 text-primary" /> Cell
                                    </label>
                                    <select
                                        required
                                        disabled={!selectedSector}
                                        value={selectedCell}
                                        onChange={(e) => setSelectedCell(e.target.value)}
                                        className="w-full h-11 px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm disabled:bg-slate-50 disabled:text-slate-400"
                                    >
                                        <option value="" disabled>Select Cell</option>
                                        {cells.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                {/* Village */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" /> Village
                                    </label>
                                    <select
                                        required
                                        disabled={!selectedCell}
                                        value={selectedVillage}
                                        onChange={(e) => setSelectedVillage(e.target.value)}
                                        className="w-full h-11 px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm disabled:bg-slate-50 disabled:text-slate-400"
                                    >
                                        <option value="" disabled>Select Village</option>
                                        {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending || !selectedVillage}
                            className="w-full h-12 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-md shadow-sm transition-colors mt-6 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Submit Registration'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link href="/dashboard" className="text-primary font-medium hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
