'use client'

import { signOut } from 'next-auth/react'
import { LogOut, User as UserIcon, Bell, Menu } from 'lucide-react'
import { NotificationCenter } from './notifications/NotificationCenter'
import { useSidebar } from './SidebarContext'

export function Topbar({ user }: { user: any }) {
    const { toggle } = useSidebar()

    return (
        <header className="h-16 bg-white border-b border-red-100 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0 shadow-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggle}
                    className="p-2 -ml-2 text-slate-400 hover:text-primary lg:hidden"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center text-slate-500 font-medium text-sm">
                    <span className="hidden xs:inline">Dashboard</span>
                    {user?.isVerified === false && (
                        <span className="ml-3 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-200 whitespace-nowrap">
                            Pending Verification
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <NotificationCenter />

                <div className="h-6 w-px bg-slate-200"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-700 flex items-center gap-2 justify-end">
                            {user?.name}
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]" title="Online"></span>
                        </p>
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
