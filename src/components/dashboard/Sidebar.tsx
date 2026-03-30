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
    ShieldCheck,
    TrendingUp,
    MapPin,
    X
} from 'lucide-react'
import { useSidebar } from './SidebarContext'
import { useState } from 'react'

export function Sidebar({ user }: { user: any }) {
    const role = user.role
    const pathname = usePathname()
    const { isOpen, close } = useSidebar()
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)

    const toggleDropdown = (name: string) => {
        setOpenDropdown(prev => prev === name ? null : name)
    }

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['MEMBER', 'VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'] },
        { name: 'My Profile', href: '/dashboard/profile', icon: Users, roles: ['MEMBER', 'VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'] },

        // Village Leader & Up
        { name: 'Member Management', href: '/dashboard/members', icon: Users, roles: ['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'] },
        { name: role === 'SECTOR_ADMIN' ? 'Jurisdictions' : 'Villages', href: '/dashboard/villages', icon: MapPin, roles: ['CELL_ADMIN', 'SECTOR_ADMIN'] },
        { name: 'Contributions', href: '/dashboard/contributions', icon: Banknote, roles: ['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'] },
        {
            name: 'Events Management',
            icon: Calendar,
            roles: ['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'],
            children: [
                { name: 'Create New Event', href: '/dashboard/activities/new' },
                { name: 'Manage Attendance', href: '/dashboard/activities' }
            ]
        },

        // Member specific
        { name: 'My Events', href: '/dashboard/my-activities', icon: Calendar, roles: ['MEMBER'] },

        // Communication & Reports
        { name: 'Announcements', href: '/dashboard/announcements', icon: Megaphone, roles: ['MEMBER', 'VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'] },
        { name: 'Data & Statistics', href: '/dashboard/statistics', icon: TrendingUp, roles: ['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'] },
        { name: 'Feedback & Issues', href: '/dashboard/feedback', icon: MessageSquare, roles: ['MEMBER', 'VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'] },
        { name: 'Reports', href: '/dashboard/reports', icon: FileText, roles: ['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'] },
        { name: 'Automated Reports', href: '/dashboard/reports/automated', icon: ShieldCheck, roles: ['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'] },

        // System Settings for Sector Admin
        { name: 'System Settings', href: '/dashboard/settings', icon: ShieldCheck, roles: ['SECTOR_ADMIN'] },
    ]

    const filteredNav = navItems.filter(item => item.roles.includes(role))

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={close}
                />
            )}

            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-red-100 flex-shrink-0 flex flex-col h-full bg-gradient-to-b from-white to-red-50/30
                transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-lg text-primary">
                        <ShieldCheck className="w-6 h-6" />
                        <span>Niboye FPR</span>
                    </div>
                    <button
                        onClick={close}
                        className="p-2 text-slate-400 hover:text-primary lg:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {filteredNav.map((item) => {
                        if (item.children) {
                            const isChildActive = item.children.some(child => pathname === child.href || pathname.startsWith(`${child.href}/`))
                            const isExpanded = openDropdown === item.name || isChildActive

                            return (
                                <div key={item.name} className="flex flex-col gap-1">
                                    <button
                                        onClick={() => toggleDropdown(item.name)}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer
                                            ${isChildActive ? 'text-primary bg-red-50/50' : 'text-slate-600 hover:bg-red-50 hover:text-primary'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`w-4 h-4 ${isChildActive ? 'text-primary' : 'text-slate-400'}`} />
                                            {item.name}
                                        </div>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {isExpanded && (
                                        <div className="ml-9 flex flex-col gap-1 border-l-2 border-slate-100 pl-2">
                                            {item.children.map(child => {
                                                const isActive = pathname === child.href || (child.href.includes('?') ? pathname === child.href.split('?')[0] : pathname.startsWith(`${child.href}/`))
                                                return (
                                                    <Link
                                                        key={child.name}
                                                        href={child.href}
                                                        onClick={close}
                                                        className={`block px-3 py-2 rounded-md text-sm transition-colors ${isActive
                                                            ? 'text-primary font-bold bg-red-50'
                                                            : 'text-slate-500 hover:text-primary hover:bg-red-50'
                                                            }`}
                                                    >
                                                        {child.name}
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        }

                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                        return (
                            <Link
                                key={item.name}
                                href={item.href!}
                                onClick={close}
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
                    <div className="flex items-center gap-3 px-3 py-3 bg-red-50/50 rounded-xl mb-4 border border-red-100/50">
                        <div className="w-10 h-10 rounded-lg bg-white border border-red-100 flex items-center justify-center overflow-hidden shrink-0">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <Users className="w-5 h-5 text-primary" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                            <p className="text-[10px] font-black text-slate-400 truncate uppercase tracking-widest">{user?.role?.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <div className="px-3 py-2 bg-red-50 rounded-md">
                        <p className="text-xs text-slate-500 mb-1">Current Protocol:</p>
                        <p className="text-xs font-semibold text-primary">Niboye Sector ({role?.replace('_', ' ')})</p>
                    </div>
                </div>
            </div>
        </>
    )
}
