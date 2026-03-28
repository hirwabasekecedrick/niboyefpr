import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getContributions, getVillageContributionSummary } from "@/app/actions/contributions";
import ContributionsClient from "./ContributionsClient";
import VillageContributionSummaryClient from "./VillageContributionSummaryClient";

export default async function ContributionsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) redirect("/login");

    const { role } = session.user;

    // Village Leader: full contribution management for their village
    if (role === "VILLAGE_LEADER") {
        const contributions = await getContributions() || [];
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Contributions</h1>
                    <p className="text-slate-500">
                        Record and manage contributions from members in your village.
                    </p>
                </div>
                <ContributionsClient
                    initialContributions={contributions as any}
                    currentUserRole={role}
                    currentUserId={session.user.id}
                />
            </div>
        );
    }

    // Cell Admin / Sector Admin: aggregated village totals only
    if (role === "CELL_ADMIN" || role === "SECTOR_ADMIN") {
        const summary = await getVillageContributionSummary();
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Contributions Overview</h1>
                    <p className="text-slate-500">
                        Village-level contribution totals within your jurisdiction.
                    </p>
                </div>
                <VillageContributionSummaryClient summary={summary} />
            </div>
        );
    }

    redirect("/dashboard");
}
