'use client'

import React, { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, CreditCard, Lock, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState('')

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')

        const formData = new FormData(e.currentTarget)
        const nationalId = formData.get('nationalId') as string
        const password = formData.get('password') as string

        startTransition(async () => {
            const res = await signIn('credentials', {
                redirect: false,
                nationalId,
                password
            })

            if (res?.error) {
                setError('Invalid National ID or Password')
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
                <div className="bg-primary px-8 py-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 -ml-10 -mt-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative z-10 flex flex-col items-center">
                        <ShieldCheck className="h-12 w-12 text-white mb-2" />
                        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
                        <p className="text-red-100 mt-2 text-sm">Sign in to your FPR Management account</p>
                    </div>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-primary p-4 rounded-r-md">
                            <p className="text-sm font-medium text-primary">{error}</p>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-primary" /> National ID
                            </label>
                            <input
                                type="text"
                                name="nationalId"
                                required
                                placeholder="16-digit ID number"
                                className="w-full h-11 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-primary" /> Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                placeholder="Enter your password"
                                className="w-full h-11 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-12 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-md shadow-sm transition-colors mt-6 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-primary font-medium hover:underline">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
