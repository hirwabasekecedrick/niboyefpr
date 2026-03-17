'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Banknote,
    Megaphone,
    Calendar,
    FileText,
    MessageSquare,
    ShieldCheck
} from 'lucide-react'

export function Sidebar({ role }: { role: string }) {
    const pathname = usePathname()

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['MEMBER', 'VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'] },
        { name: 'My Profile', href: '/dashboard/profile', icon: Users, roles: ['MEMBER', 'VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'] },

        // Village Leader & Up
        { name: 'Member Management', href: '/dashboard/members', icon: Users, roles: ['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'] },
        { name: 'Contributions', href: '/dashboard/contributions', icon: Banknote, roles: ['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'] },
        { name: 'Activities & Attendance', href: '/dashboard/activities', icon: Calendar, roles: ['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'] },

        // Member specific
        { name: 'My Activities', href: '/dashboard/my-activities', icon: Calendar, roles: ['MEMBER'] },

        // Communication & Reports
        { name: 'Announcements', href: '/dashboard/announcements', icon: Megaphone, roles: ['MEMBER', 'VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'] },
        { name: 'Feedback & Issues', href: '/dashboard/feedback', icon: MessageSquare, roles: ['MEMBER', 'VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'] },
        { name: 'Reports', href: '/dashboard/reports', icon: FileText, roles: ['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'] },
        { name: 'Automated Reports', href: '/dashboard/reports/automated', icon: ShieldCheck, roles: ['CELL_ADMIN', 'SECTOR_ADMIN'] },

        // System Settings for Sector Admin
        { name: 'System Settings', href: '/dashboard/settings', icon: ShieldCheck, roles: ['SECTOR_ADMIN'] },
    ]

    const filteredNav = navItems.filter(item => item.roles.includes(role))

    return (
        <div className="w-64 bg-white border-r border-red-100 flex-shrink-0 flex flex-col h-full bg-gradient-to-b from-white to-red-50/30">
            <div className="p-6">
                <div className="flex items-center gap-2 font-bold text-lg text-primary">
                    <ShieldCheck className="w-6 h-6" />
                    <span>Niboye FPR</span>
                </div>
            </div>
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {filteredNav.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-slate-600 hover:bg-red-50 hover:text-primary'
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${isActive ? 'text-red-100' : 'text-slate-400'}`} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-red-100">
                <div className="px-3 py-2 bg-red-50 rounded-md">
                    <p className="text-xs text-slate-500 mb-1">Current Protocol:</p>
                    <p className="text-xs font-semibold text-primary">Niboye Sector ({role})</p>
                </div>
            </div>
        </div>
    )
}
