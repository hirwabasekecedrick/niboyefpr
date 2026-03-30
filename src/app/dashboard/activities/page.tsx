import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getActivities } from "@/app/actions/activities"
import { CreateActivityCard } from "@/components/dashboard/activities/CreateActivityCard"
import { Calendar, Users, Clock, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function ActivitiesPage() {
    const session = await getServerSession(authOptions)
    const activities = await getActivities()

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-primary" />
                        Events Management
                    </h1>
                    <p className="text-slate-500 text-sm">Create events and track real-time attendance digitally.</p>
                </div>
                {['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'].includes(session?.user?.role || '') && (
                    <Link
                        href="/dashboard/activities/new"
                        className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-all font-bold shadow-sm text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Create New Event
                    </Link>
                )}
            </div>

            <div className="space-y-4">
                {activities.length === 0 ? (
                    <div className="bg-white p-20 text-center rounded-2xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-primary/40" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No events scheduled</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">Start by creating your first village or sector level event to track attendance.</p>
                        {['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'].includes(session?.user?.role || '') && (
                            <Link
                                href="/dashboard/activities/new"
                                className="inline-flex items-center gap-2 text-primary hover:underline font-bold mt-4 text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Create your first event
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {activities.map((act) => (
                            <Link key={act.id} href={`/dashboard/activities/${act.id}`} className="group">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm group-hover:shadow-md group-hover:border-primary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 flex-shrink-0 group-hover:bg-red-50 group-hover:border-red-100 transition-colors">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">
                                                {new Date(act.date).toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                            <span className="text-2xl font-black text-slate-800 leading-none group-hover:scale-110 transition-transform">
                                                {new Date(act.date).getDate()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${act.level === 'SECTOR' ? 'bg-red-50 text-primary border-red-100' :
                                                    act.level === 'CELL' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'
                                                    }`}>
                                                    {act.level} Level
                                                </span>
                                                {(act as any).startTime && (
                                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                        {(act as any).startTime}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors truncate">{act.title}</h3>
                                            <p className="text-slate-500 text-sm line-clamp-1">{act.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                                        <div className="flex gap-4">
                                            <div className="text-right">
                                                <p className="text-lg font-black text-slate-800 leading-none">{(act as any)._count.attendances}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Attended</p>
                                            </div>
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-primary transition-colors">
                                                <Users className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
