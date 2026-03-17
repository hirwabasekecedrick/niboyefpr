import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { AttendanceTracker } from "@/components/dashboard/activities/AttendanceTracker";
import { getVillageMembers } from "@/app/actions/village-leader";
import { getAttendancesForActivity } from "@/app/actions/activities";
import { Calendar, MapPin, Info } from "lucide-react";

export default async function ActivityDetailPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");
    //Params to get the activity id
    const activityId = params.id;

    const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
            author: { select: { name: true, role: true } }
        } as any
    });

    if (!activity) redirect("/dashboard/activities");

    // Fetch relevant members for attendance based on level
    // Simplified logic: If village level, get village members. If cell, get cell members.
    let members = [];
    if (activity.level === 'VILLAGE') {
        members = await getVillageMembers(session.user.villageId || '');
    } else if (activity.level === 'CELL') {
        members = await prisma.user.findMany({
            where: { cellId: session.user.cellId, role: 'MEMBER' },
            orderBy: { name: 'asc' }
        });
    } else {
        members = await prisma.user.findMany({
            where: { sectorId: session.user.sectorId, role: 'MEMBER' },
            orderBy: { name: 'asc' },
            take: 50 // Limit for performance in this demo
        });
    }

    const initialAttendances = await getAttendancesForActivity(activityId);

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${activity.level === 'SECTOR' ? 'bg-red-100 text-primary' :
                            activity.level === 'CELL' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                            {activity.level} Level
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3" />
                            {new Date(activity.date).toLocaleDateString()}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{activity.title}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Activity Details</h2>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <Info className="w-5 h-5 text-primary shrink-0" />
                                <p className="text-sm text-slate-600 leading-relaxed">{activity.description || 'No description provided.'}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0" />
                                <p className="text-sm text-slate-600">Location: {activity.level} jurisdiction</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-50">
                            <p className="text-xs text-slate-400 italic">Created by {(activity as any).author.name} ({(activity as any).author.role.toLowerCase().replace('_', ' ')})</p>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                        <h3 className="text-primary font-bold mb-2">Registration Required</h3>
                        <p className="text-xs text-primary/80 mb-4">Members are encouraged to register their attendance digitally for better record keeping.</p>
                        <button className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
                            Toggle Registration Open
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <AttendanceTracker
                        activityId={activityId}
                        activityTitle={activity.title}
                        members={members}
                        initialAttendances={initialAttendances}
                    />
                </div>
            </div>
        </div>
    );
}
