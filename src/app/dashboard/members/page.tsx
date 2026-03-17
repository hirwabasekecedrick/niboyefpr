import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MemberManagementClient from "./MemberManagementClient";

export default async function MembersPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    // Ensure only Cell Admins or Sector Admins can access full member management for now.
    if (!['CELL_ADMIN', 'SECTOR_ADMIN', 'VILLAGE_LEADER'].includes(session.user.role)) {
        redirect("/dashboard");
    }

    // To simplify for Phase 1 verification, we fetch members based on the user's role/cell.
    // Sector Admins would theoretically see everything, Village Leaders just their village. 
    // Let's pass the cell Id to simulate the "Cell Administrator" task.

    const cellId = session.user.cellId;

    if (!cellId && session.user.role === 'CELL_ADMIN') {
        return <div className="p-6 text-red-500">Error: Administrator is not assigned to a Cell.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    Member Management
                </h1>
                <p className="text-slate-500">
                    Review member registrations and perform data verification.
                </p>
            </div>

            <MemberManagementClient cellId={cellId || ''} />
        </div>
    );
}
