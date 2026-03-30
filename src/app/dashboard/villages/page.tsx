import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import VillagesClient from "./VillagesClient";
import { getVillagesForAdmin } from "@/app/actions/cell-admin";

export default async function VillagesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    if (!['CELL_ADMIN', 'SECTOR_ADMIN'].includes(session.user.role)) {
        redirect("/dashboard");
    }

    const sectorId = session.user.sectorId || '';
    const cellId = session.user.cellId || '';
    const initialVillages = await getVillagesForAdmin(cellId ? cellId : undefined);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {session.user.role === 'SECTOR_ADMIN' ? 'Jurisdictional Hierarchy' : 'Village Management'}
                </h1>
                <p className="text-slate-500">
                    {session.user.role === 'SECTOR_ADMIN'
                        ? 'Overview of cells and villages within the sector.'
                        : 'Manage and register new villages within your jurisdiction.'}
                </p>
            </div>

            <VillagesClient
                initialVillages={initialVillages}
                cellId={cellId}
                sectorId={sectorId}
                currentUserRole={session.user.role}
            />
        </div>
    );
}
