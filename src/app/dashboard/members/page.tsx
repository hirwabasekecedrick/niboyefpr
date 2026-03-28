import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MemberManagementClient from "./MemberManagementClient";

export default async function MembersPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    if (!['CELL_ADMIN', 'SECTOR_ADMIN', 'VILLAGE_LEADER'].includes(session.user.role)) {
        redirect("/dashboard");
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    Member Management
                </h1>
                <p className="text-slate-500">
                    Review member registrations, verify data, and manage your jurisdiction.
                </p>
            </div>

            <MemberManagementClient
                cellId={session.user.cellId || undefined}
                sectorId={session.user.sectorId || undefined}
                villageId={session.user.villageId || undefined}
                currentUserRole={session.user.role}
            />
        </div>
    );
}
