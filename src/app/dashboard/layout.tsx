import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar role={session.user.role} />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Topbar user={session.user} />
                <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
