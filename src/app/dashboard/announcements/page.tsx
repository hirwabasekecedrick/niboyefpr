import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getAnnouncements } from "@/app/actions/announcements"
import { CreateAnnouncementForm } from "@/components/dashboard/announcements/CreateAnnouncementForm"
import { Megaphone, User, Clock } from "lucide-react"
import { DeleteAnnouncementButton } from "@/components/dashboard/announcements/DeleteAnnouncementButton"

export default async function AnnouncementsPage() {
    const session = await getServerSession(authOptions)
    const announcements = await getAnnouncements()
    const currentUser = session?.user

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Announcements</h1>
                <p className="text-slate-500">Stay updated with the latest news from Niboye Sector.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'].includes(session?.user?.role || '') && (
                    <div className="lg:col-span-1">
                        <CreateAnnouncementForm userRole={session?.user?.role || ''} />
                    </div>
                )}

                <div className={['VILLAGE_LEADER', 'CELL_ADMIN', 'SECTOR_ADMIN'].includes(session?.user?.role || '') ? "lg:col-span-2 space-y-4" : "lg:col-span-3 space-y-4"}>
                    {announcements.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-xl border border-red-50 text-slate-400">
                            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No announcements yet.</p>
                        </div>
                    ) : (
                        announcements.map((ann) => {
                            const isAuthor = currentUser?.id === ann.authorId
                            const isHigherAdmin = ['CELL_ADMIN', 'SECTOR_ADMIN'].includes(currentUser?.role || '')
                            const canDelete = isAuthor || isHigherAdmin

                            return (
                                <div key={ann.id} className="bg-white p-6 rounded-xl border border-red-50 shadow-sm hover:border-red-200 transition-colors relative group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${ann.level === 'SECTOR' ? 'bg-red-100 text-primary' :
                                                ann.level === 'CELL' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {ann.level} Level
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-800 mt-2">{ann.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(ann.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            {canDelete && <DeleteAnnouncementButton id={ann.id} />}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-500">
                                        <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-primary border border-red-100">
                                            <User className="w-3 h-3" />
                                        </div>
                                        <span className="font-medium text-slate-700">{ann.author.name}</span>
                                        <span className="opacity-50">•</span>
                                        <span className="capitalize">{ann.author.role.toLowerCase().replace('_', ' ')}</span>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
