import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getVillageMembers, getContributionsByVillage } from "@/app/actions/village-leader";
import { RecordContributionForm } from "@/components/dashboard/contributions/RecordContributionForm";
import { Banknote, TrendingUp } from "lucide-react";

export default async function ContributionsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user || !['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'].includes(session.user.role)) {
        redirect("/dashboard");
    }

    // Simplified: Default to the user's village for the tracking mechanism
    const villageId = session.user.villageId;

    if (!villageId) {
        return <div className="p-6 text-red-500">Error: Leader is not assigned to a Village.</div>;
    }

    const members = await getVillageMembers(villageId);
    const contributions = await getContributionsByVillage(villageId);

    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    Contribution Tracking
                </h1>
                <p className="text-slate-500">
                    Manage and track member financial contributions for your village.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 items-start">

                {/* Left Column: Form & Stats */}
                <div className="space-y-6 md:col-span-1">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-red-50 rounded-full">
                            <Banknote className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Collected</p>
                            <h3 className="text-2xl font-bold text-slate-800">
                                {totalContributions.toLocaleString()} <span className="text-sm font-medium text-slate-500">RWF</span>
                            </h3>
                        </div>
                    </div>

                    <RecordContributionForm members={members} />
                </div>

                {/* Right Column: History Table */}
                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Recent Contributions
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        {contributions.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                No contributions recorded yet.
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                        <th className="px-6 py-3 font-medium">Date</th>
                                        <th className="px-6 py-3 font-medium">Member Name</th>
                                        <th className="px-6 py-3 font-medium">National ID</th>
                                        <th className="px-6 py-3 font-medium text-right">Amount (RWF)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {contributions.map(contribution => (
                                        <tr key={contribution.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                                {new Date(contribution.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-800">
                                                {contribution.member.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                                {contribution.member.nationalId}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-primary text-right whitespace-nowrap">
                                                {contribution.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
