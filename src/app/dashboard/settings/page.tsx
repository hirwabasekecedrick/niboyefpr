import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSystemStats, getVillageGrading } from "@/app/actions/statistics"
import { StatisticsOverview } from "@/components/dashboard/statistics/StatisticsOverview"

export default async function StatisticsPage() {
    const session = await getServerSession(authOptions)

    if (!['SECTOR_ADMIN', 'CELL_ADMIN'].includes(session?.user?.role || '')) {
        redirect("/dashboard")
    }

    const stats = await getSystemStats()
    const grading = await getVillageGrading()

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Data-Driven Insights</h1>
                <p className="text-slate-500">Comprehensive statistics and performance grading for Niboye Sector.</p>
            </div>

            <StatisticsOverview stats={stats} grading={grading} />
        </div>
    )
}
