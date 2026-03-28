import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ShieldAlert, Activity, Users, TrendingUp } from "lucide-react";
import { VillagePerformanceStats } from "@/components/dashboard/VillagePerformanceStats";
import { CellPerformanceStats } from "@/components/dashboard/CellPerformanceStats";
import { getVillagePerformance, getCellPerformance } from "@/app/actions/performance";
import { getMemberData } from "@/app/actions/member";
import { MemberOverview } from "@/components/dashboard/MemberOverview";
import Link from "next/link";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user) return null;

    const isAdminOrLeader = ['SECTOR_ADMIN', 'CELL_ADMIN', 'VILLAGE_LEADER'].includes(user.role);

    // If SECTOR_ADMIN, fetch cell performance. Otherwise, fetch village performance.
    const performanceData = user.role === 'SECTOR_ADMIN'
        ? await getCellPerformance()
        : (isAdminOrLeader ? await getVillagePerformance(user.role === 'VILLAGE_LEADER' ? (user.cellId || undefined) : undefined) : []);

    const memberData = (user.role === 'MEMBER' && user.isVerified)
        ? await getMemberData()
        : null;

    const totalMembers = performanceData.reduce((sum, p) => sum + p.memberCount, 0);
    const totalContributions = performanceData.reduce((sum, p) => sum + ((p as any).totalContribution || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    Welcome back, {user.name}
                </h1>
                <p className="text-slate-500">
                    Here is an overview of the Niboye Sector FPR Management System.
                </p>
            </div>

            {user.isVerified === false && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <ShieldAlert className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-yellow-800 font-semibold mb-1">Account Pending Verification</h3>
                        <p className="text-yellow-700 text-sm">
                            Your account details are currently being reviewed by Cell Administrators. Some features of the platform may be restricted until your data is verified.
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            {memberData ? (
                <MemberOverview data={memberData} />
            ) : (
                <div className="space-y-8">
                    {/* Role-Based Quick Overview Cards */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pt-4">
                        {isAdminOrLeader && (
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">Members</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{totalMembers}</h3>
                                    <p className="text-xs text-slate-400 font-medium">Active in jurisdiction</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                                    <Activity className="w-6 h-6 text-primary" />
                                </div>
                                <span className="text-[10px] font-bold text-primary bg-red-50 px-2 py-1 rounded-full uppercase">Location</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight truncate">
                                    {user.role === 'SECTOR_ADMIN' ? 'Full Sector' : performanceData.find(p => p.id === user.villageId)?.name || 'Niboye'}
                                </h3>
                                <p className="text-xs text-slate-400 font-medium tracking-tight">Assigned management unit</p>
                            </div>
                        </div>

                        {isAdminOrLeader && (
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                    </div>
                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">Finance</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{totalContributions.toLocaleString()} RWF</h3>
                                    <p className="text-xs text-slate-400 font-medium">Total contributions tracked</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl flex flex-col justify-between hover:bg-slate-800 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10">
                                    <ShieldAlert className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-[10px] font-bold text-white bg-white/10 px-2 py-1 rounded-full uppercase border border-white/10">Quick Actions</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Link href="/dashboard/announcements" className="text-[10px] font-bold bg-white/10 hover:bg-white text-white hover:text-slate-900 py-2 rounded-lg text-center transition-all border border-white/5">
                                    Post Update
                                </Link>
                                <Link href="/dashboard/activities" className="text-[10px] font-bold bg-white/10 hover:bg-white text-white hover:text-slate-900 py-2 rounded-lg text-center transition-all border border-white/5">
                                    Track Event
                                </Link>
                            </div>
                        </div>
                    </div>

                    {performanceData.length > 0 && (
                        <div className="grid grid-cols-1 gap-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {user.role === 'SECTOR_ADMIN' ? (
                                <CellPerformanceStats performance={performanceData} />
                            ) : (
                                <VillagePerformanceStats performance={performanceData} />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
