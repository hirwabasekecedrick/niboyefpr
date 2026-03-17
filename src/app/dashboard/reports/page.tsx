import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getReports } from "@/app/actions/reports";
import { SubmitReportCard } from "@/components/dashboard/reports/SubmitReportCard";
import { FileText, User, Calendar, MapPin, ImageIcon } from "lucide-react";

export default async function ReportsPage() {
    const session = await getServerSession(authOptions);
    const reports = await getReports();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">System Reports</h1>
                <p className="text-slate-500">Track activities and performance reports across the sector.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <SubmitReportCard />
                </div>

                <div className="lg:col-span-3 space-y-4">
                    {reports.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-xl border border-red-50 text-slate-400">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No reports found.</p>
                        </div>
                    ) : (
                        reports.map((report) => (
                            <div key={report.id} className="bg-white p-6 rounded-xl border border-red-50 shadow-sm hover:border-red-200 transition-colors">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${report.level === 'SECTOR' ? 'bg-red-100 text-primary' :
                                                    report.level === 'CELL' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {report.level} Level
                                            </span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-800 mb-2">{report.title}</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-4">{report.content}</p>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <User className="w-3 h-3 text-primary" />
                                                <span className="font-medium">{report.author.name}</span>
                                                <span className="opacity-50">({report.author.role.toLowerCase().replace('_', ' ')})</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                <span>{report.village?.name || report.cell?.name || 'Sector level'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {report.imageUrl && (
                                        <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200 self-start">
                                            <img
                                                src={report.imageUrl}
                                                alt="Evidence"
                                                className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
