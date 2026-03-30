import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getActivities } from "@/app/actions/activities"
import { Calendar, Users, MapPin, Laptop, Clock } from "lucide-react"
import Link from "next/link"

export default async function MyActivitiesPage() {
    const session = await getServerSession(authOptions)
    const activities = await getActivities()

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Events</h1>
                <p className="text-slate-500">View and participate in events in your village and hierarchy.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {activities.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-xl border border-red-50 text-slate-400">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No events scheduled yet.</p>
                    </div>
                ) : (
                    activities.map((act) => (
                        <Link key={act.id} href={`/dashboard/activities/${act.id}`} className="block group">
                            <div className="bg-white p-6 rounded-xl border border-red-50 shadow-sm group-hover:border-red-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 rounded-lg bg-red-50 flex flex-col items-center justify-center border border-red-100 flex-shrink-0">
                                        <span className="text-[10px] font-bold text-primary uppercase">
                                            {new Date(act.date).toLocaleDateString('en-US', { month: 'short' })}
                                        </span>
                                        <span className="text-xl font-black text-slate-800 leading-none">
                                            {new Date(act.date).getDate()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${act.level === 'SECTOR' ? 'bg-red-100 text-primary' :
                                                act.level === 'CELL' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {act.level} Level
                                            </span>
                                            {(act as any).startTime && (
                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                                                    <Clock className="w-3 h-3" />
                                                    {(act as any).startTime}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 truncate">{act.title}</h3>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                                            {(act as any).isOnline ? (
                                                <span className="flex items-center gap-1">
                                                    <Laptop className="w-3 h-3 text-primary" />
                                                    Online Meeting
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-primary" />
                                                    {(act as any).location || 'TBA'}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3 text-primary" />
                                                {(act as any)._count.attendances} Attending
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center self-end md:self-center">
                                    <span className="text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">
                                        View Details & Register →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
