'use client'

import { Calendar, Bell, MapPin, CheckCircle2, TrendingUp, Users } from "lucide-react"

interface MemberOverviewProps {
    data: any;
}

export function MemberOverview({ data }: MemberOverviewProps) {
    const { user, activities, announcements } = data;
    const myAttendanceCount = user.attendances?.length || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                            <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-[10px] font-bold text-primary bg-red-50/50 px-2 py-1 rounded-full uppercase border border-red-100/50">My Attendance</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                            {myAttendanceCount} <span className="text-sm font-medium text-slate-400">Events</span>
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">Lifetime participation</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                            <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50/50 px-2 py-1 rounded-full uppercase border border-blue-100/50">My Location</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">
                            {user.village?.name || 'Niboye'}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium tracking-tight truncate">
                            {user.cell?.name} Cell
                        </p>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl shadow-xl flex flex-col justify-between hover:bg-slate-800 transition-all border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-green-500/20 transition-all"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm relative z-10">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-white bg-green-500/80 px-2 py-1 rounded-full uppercase relative z-10">Verified Member</span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white tracking-tight">Status: Active</h3>
                        <p className="text-xs text-white/60 font-medium">Your credentials are validated</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Participation Summary */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            Participation History
                        </h3>
                    </div>
                    <div className="p-8">
                        {user.attendances?.length === 0 ? (
                            <div className="text-center text-slate-400 text-sm py-12">No recorded participation yet. Join upcoming activities!</div>
                        ) : (
                            <div className="space-y-4">
                                {user.attendances?.map((att: any) => (
                                    <div key={att.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors group">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(att.date).toLocaleDateString()}</span>
                                            <span className="text-sm font-bold text-slate-700 mt-0.5 group-hover:text-primary transition-colors">Attended Primary Meeting</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">PRESENT</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Local Activities & Announcements */}
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden shadow-indigo-50/50">
                        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                Upcoming Activities
                            </h3>
                        </div>
                        <div className="p-8 space-y-6">
                            {activities.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-slate-400 text-sm italic">No upcoming activities scheduled for your area.</p>
                                </div>
                            ) : (
                                activities.map((a: any) => (
                                    <div key={a.id} className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group">
                                        <div className="w-14 h-14 bg-blue-50 rounded-xl flex flex-col items-center justify-center text-blue-600 shrink-0 border border-blue-100 group-hover:bg-blue-100 group-hover:scale-105 transition-all">
                                            <span className="text-[10px] font-black uppercase">{new Date(a.date).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-xl font-black leading-none">{new Date(a.date).getDate()}</span>
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h4 className="text-sm font-black text-slate-800 line-clamp-1 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{a.title}</h4>
                                            <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium italic">{a.description}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden shadow-amber-50/30">
                        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
                                <Bell className="w-4 h-4 text-amber-600" />
                                Important Updates
                            </h3>
                        </div>
                        <div className="p-8 space-y-6">
                            {announcements.length === 0 ? (
                                <p className="text-slate-400 text-sm italic text-center py-4">Stay tuned for new updates.</p>
                            ) : (
                                announcements.map((an: any) => (
                                    <div key={an.id} className="p-5 rounded-2xl bg-amber-50/30 border border-amber-100 hover:bg-amber-50/50 transition-colors cursor-default">
                                        <h4 className="text-sm font-black text-slate-800 mb-2 uppercase tracking-tight">{an.title}</h4>
                                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium">{an.content}</p>
                                        <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-amber-700 uppercase">{an.level} LEVEL</span>
                                            <span className="text-[10px] font-bold text-slate-400">{new Date(an.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
