import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CreateActivityCard } from "@/components/dashboard/activities/CreateActivityCard"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function NewActivityPage() {
    const session = await getServerSession(authOptions)

    if (!['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'].includes(session?.user?.role || '')) {
        redirect('/dashboard/activities')
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/activities"
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Create New Event</h1>
                    <p className="text-slate-500 text-sm">Fill in the details to schedule a new village/cell activity.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-red-50 overflow-hidden">
                <CreateActivityCard userRole={session?.user?.role || ''} />
            </div>
        </div>
    )
}
