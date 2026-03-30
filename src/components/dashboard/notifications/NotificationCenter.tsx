'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Info, AlertTriangle, CheckCircle, BellOff } from 'lucide-react'
import { getNotifications, markNotificationAsRead } from '@/app/actions/notifications'

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    useEffect(() => {
        async function load() {
            const data = await getNotifications()
            setNotifications(data)
            setUnreadCount(data.filter((n: any) => !n.isRead).length)
        }
        load()
        // Periodic refresh
        const interval = setInterval(load, 60000)
        return () => clearInterval(interval)
    }, [])

    const handleMarkAsRead = async (id: string) => {
        const res = await markNotificationAsRead(id)
        if (res.success) {
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        }
    }

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-400 hover:text-primary relative hover:bg-red-50 rounded-full transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-[10px] font-black text-white flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-red-50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{unreadCount} New</span>
                        )}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <BellOff className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-xs">No notifications yet.</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-red-50/30' : ''}`}
                                    onClick={() => handleMarkAsRead(n.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            {n.type === 'SUCCESS' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                            {n.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                                            {n.type === 'INFO' && <Info className="w-4 h-4 text-blue-500" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-slate-800">{n.title}</p>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                                            <p className="text-[10px] text-slate-400 mt-2">{new Date(n.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-3 text-center border-t border-slate-50 bg-slate-50/30">
                        <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">
                            View All History
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
