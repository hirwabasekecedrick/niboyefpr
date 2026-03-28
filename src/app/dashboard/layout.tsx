import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { ActiveStatusTracker } from "@/components/dashboard/ActiveStatusTracker";

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
        <SidebarProvider>
            <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
                <ActiveStatusTracker />
                <Sidebar role={session.user.role} />
                <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
                    <Topbar user={session.user} />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
                        <div className="max-w-6xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
