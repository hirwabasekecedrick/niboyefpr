import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSystemStats, getVillageGrading } from "@/app/actions/statistics";
import { StatisticsClient } from "@/components/dashboard/statistics/StatisticsClient";

export default async function StatisticsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'].includes(session.user.role)) {
        redirect("/dashboard");
    }

    const stats = await getSystemStats();
    const grading = await getVillageGrading();

    if (!stats) {
        return <div className="p-6 text-red-500">Error: Failed to load system statistics.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Data Insights & Analytics</h1>
                <p className="text-slate-500">Comprehensive overview of membership, contributions, and village performance.</p>
            </div>

            <StatisticsClient stats={stats} grading={grading} />
        </div>
    );
}
