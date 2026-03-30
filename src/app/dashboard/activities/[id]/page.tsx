import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { AttendanceTracker } from "@/components/dashboard/activities/AttendanceTracker";
import { getVillageMembers } from "@/app/actions/village-leader";
import { getAttendancesForActivity, getExpectedAttendees } from "@/app/actions/activities";
import { Calendar, MapPin, Info, CheckCircle2, Users, Laptop, ExternalLink, Clock } from "lucide-react";
import { EventRegistration } from "@/components/dashboard/activities/EventRegistration";
import { EventQRCode } from "@/components/dashboard/activities/EventQRCode";
import { QRScanner } from "@/components/dashboard/activities/QRScanner";
import { EventEditor } from "@/components/dashboard/activities/EventEditor";

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");
    //Params to get the activity id
    const resolvedParams = await params;
    const activityId = resolvedParams.id;

    const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
            author: { select: { name: true, role: true } }
        } as any
    });

    if (!activity) redirect("/dashboard/activities");

    // Fetch expected members
    let members = [];
    if (activity.level === 'VILLAGE') {
        // For Villages, it's small enough to show the full register.
        members = await getVillageMembers(session.user.villageId || '');
    } else {
        // For Cell/Sector, only fetch those who registered or already have attendance marked
        members = await getExpectedAttendees(activityId);
    }

    const initialAttendances = await getAttendancesForActivity(activityId);

    const isMember = session.user.role === 'MEMBER';
    const isRegistered = await prisma.eventRegistration.findUnique({
        where: { userId_activityId: { userId: session.user.id, activityId } }
    }) !== null;

    const registrationCount = await prisma.eventRegistration.count({
        where: { activityId }
    });

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
                            <Calendar className="w-4 h-4" />
                            {new Date(activity.date).toLocaleDateString()}
                        </span>
                        {(activity as any).startTime && (
                            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium border-l border-slate-200 pl-2">
                                <Clock className="w-3 h-3" />
                                {(activity as any).startTime}
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{activity.title}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Event Details</h2>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <Info className="w-5 h-5 text-primary shrink-0" />
                                <p className="text-sm text-slate-600 leading-relaxed">{activity.description || 'No description provided.'}</p>
                            </div>
                            {(activity as any).isOnline ? (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <Laptop className="w-5 h-5 text-primary shrink-0" />
                                        <p className="text-sm font-bold text-slate-800">Online Event</p>
                                    </div>
                                    {(activity as any).onlineLink && (
                                        <a
                                            href={(activity as any).onlineLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-8 text-sm text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            Join Meeting
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-primary shrink-0" />
                                    <p className="text-sm text-slate-600">
                                        Location: <span className="font-semibold text-slate-800">{(activity as any).location || `${activity.level} jurisdiction`}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-50">
                            <p className="text-xs text-slate-400 italic">Created by {(activity as any).author.name} ({(activity as any).author.role.toLowerCase().replace('_', ' ')})</p>
                        </div>
                    </div>

                    {((activity as any).notes || (activity as any).photos?.length > 0) && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                            {(activity as any).notes && (
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Event Notes</h3>
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{(activity as any).notes}</p>
                                </div>
                            )}
                            {(activity as any).photos?.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Event Photos</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {(activity as any).photos.map((url: string, idx: number) => (
                                            <div key={idx} className="rounded-lg overflow-hidden border border-slate-100">
                                                <img src={url} alt={`Event photo ${idx + 1}`} className="w-full h-auto" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!isMember && (
                        <EventEditor
                            activityId={activityId}
                            initialNotes={(activity as any).notes}
                            initialPhotos={(activity as any).photos || []}
                        />
                    )}

                    {!isMember ? (
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-500" />
                                    Registrations
                                </h3>
                                <span className="text-xl font-black text-slate-900">{registrationCount}</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">Members who have confirmed their intent to attend digitaly.</p>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${Math.min((registrationCount / members.length) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                    ) : (
                        <EventRegistration
                            activityId={activityId}
                            isAlreadyRegistered={isRegistered}
                        />
                    )}
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {!isMember ? (
                        <>
                            <EventQRCode
                                activityId={activityId}
                                activityTitle={activity.title}
                                activityDate={activity.date.toISOString()}
                            />
                            <AttendanceTracker
                                activityId={activityId}
                                activityTitle={activity.title}
                                initialMembers={members}
                                initialAttendances={initialAttendances}
                                activityLevel={activity.level}
                                cellId={session.user.cellId}
                                sectorId={session.user.sectorId}
                            />
                        </>
                    ) : (
                        <div className="space-y-6">
                            <QRScanner
                                activityId={activityId}
                                activityTitle={activity.title}
                            />
                            <div className="bg-white p-12 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                    <Calendar className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Participation Overview</h3>
                                <p className="max-w-md text-slate-500 mt-2">
                                    Thank you for your interest in this event. As a member, you can scan the QR code provided by the leader to record your attendance. Your attendance will then wait for leader confirmation.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
