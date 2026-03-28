import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getActivities } from "@/app/actions/activities"
import { CreateActivityCard } from "@/components/dashboard/activities/CreateActivityCard"
import { Calendar, Users, Clock } from "lucide-react"
import Link from "next/link"

export default async function ActivitiesPage() {
    const session = await getServerSession(authOptions)
    const activities = await getActivities()

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Activities & Attendance</h1>
                <p className="text-slate-500">Create events and track real-time attendance digitaly.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'].includes(session?.user?.role || '') && (
                    <div className="lg:col-span-1">
                        <CreateActivityCard userRole={session?.user?.role || ''} />
                    </div>
                )}

                <div className={['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'].includes(session?.user?.role || '') ? "lg:col-span-2 space-y-4" : "lg:col-span-3 space-y-4"}>
                    {activities.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-xl border border-red-50 text-slate-400">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No activities scheduled yet.</p>
                        </div>
                    ) : (
                        activities.map((act) => (
                            <Link key={act.id} href={`/dashboard/activities/${act.id}`} className="block">
                                <div className="bg-white p-6 rounded-xl border border-red-50 shadow-sm hover:border-red-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-lg bg-red-50 flex flex-col items-center justify-center border border-red-100 flex-shrink-0">
                                            <span className="text-[10px] font-bold text-primary uppercase">
                                                {new Date(act.date).toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                            <span className="text-xl font-black text-slate-800 leading-none">
                                                {new Date(act.date).getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
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
                                            <h3 className="text-lg font-bold text-slate-800 mt-1">{act.title}</h3>
                                            <p className="text-slate-500 text-sm line-clamp-1">{act.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                                        <div className="text-center px-4">
                                            <p className="text-sm font-bold text-slate-800">{(act as any)._count.attendances}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-medium">Attended</p>
                                        </div>
                                        <div className="bg-slate-100 p-2 rounded-lg">
                                            <Users className="w-5 h-5 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
