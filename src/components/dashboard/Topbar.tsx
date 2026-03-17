'use client'

import { signOut } from 'next-auth/react'
import { LogOut, User as UserIcon, Bell } from 'lucide-react'
import { NotificationCenter } from './notifications/NotificationCenter'

export function Topbar({ user }: { user: any }) {
    return (
        <header className="h-16 bg-white border-b border-red-100 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0 shadow-sm">
            <div className="flex items-center text-slate-500 font-medium text-sm">
                Dashboard
                {user?.isVerified === false && (
                    <span className="ml-3 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-200">
                        Pending Verification
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4">
                <NotificationCenter />

                <div className="h-6 w-px bg-slate-200"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-700">{user?.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.role?.replace('_', ' ')}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-primary border border-red-100 shadow-sm">
                        <UserIcon className="w-5 h-5" />
                    </div>

                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="p-2 text-slate-400 hover:bg-red-50 hover:text-primary rounded-full transition-colors ml-1"
                        title="Sign out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    )
}
