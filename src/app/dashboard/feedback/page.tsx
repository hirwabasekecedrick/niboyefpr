import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getFeedback } from "@/app/actions/feedback"
import { FeedbackForm } from "@/components/dashboard/feedback/FeedbackForm"
import { MessageSquare, User, Clock } from "lucide-react"

export default async function FeedbackPage() {
    const session = await getServerSession(authOptions)
    const feedbacks = await getFeedback()

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Feedback & Issues</h1>
                <p className="text-slate-500">Share your thoughts or report issues directly to the administration.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <FeedbackForm />
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2">Recent Feedback</h2>
                    {feedbacks.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-xl border border-red-50 text-slate-400">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No feedback found.</p>
                        </div>
                    ) : (
                        feedbacks.map((item) => (
                            <div key={item.id} className="bg-white p-6 rounded-xl border border-red-50 shadow-sm hover:border-red-200 transition-colors">
                                <p className="text-slate-700 text-sm leading-relaxed mb-4">{item.message}</p>
                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <User className="w-3 h-3" />
                                        </div>
                                        <span className="font-medium text-slate-700">{item.author.name}</span>
                                        <span className="opacity-50">({item.author.role.toLowerCase().replace('_', ' ')})</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
