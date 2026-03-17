import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ShieldAlert, Activity, Users, CheckCircle } from "lucide-react";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user) return null;

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
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 flex items-start gap-4">
                    <ShieldAlert className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-yellow-800 font-semibold mb-1">Account Pending Verification</h3>
                        <p className="text-yellow-700 text-sm">
                            Your account details are currently being reviewed by Cell Administrators. Some features of the platform may be restricted until your data is verified.
                        </p>
                    </div>
                </div>
            )}

            {/* Role-Based Quick Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4">

                {['SECTOR_ADMIN', 'CELL_ADMIN', 'VILLAGE_LEADER'].includes(user.role) && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-3">
                        <div className="p-3 bg-red-50 rounded-full">
                            <Users className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active Members</p>
                            <h3 className="text-2xl font-bold text-slate-800">---</h3>
                        </div>
                    </div>
                )}

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-3">
                    <div className="p-3 bg-red-50 rounded-full">
                        <Activity className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Upcoming Activities</p>
                        <h3 className="text-2xl font-bold text-slate-800">---</h3>
                    </div>
                </div>

                {['SECTOR_ADMIN', 'CELL_ADMIN'].includes(user.role) && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-3">
                        <div className="p-3 bg-red-50 rounded-full">
                            <CheckCircle className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending Verifications</p>
                            <h3 className="text-2xl font-bold text-slate-800">---</h3>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
