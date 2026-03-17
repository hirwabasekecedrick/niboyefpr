import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { FileText, Download, Printer, TrendingUp, Users, Building } from "lucide-react"

export default async function AutomatedReportingPage() {
    const session = await getServerSession(authOptions)
    if (!['SECTOR_ADMIN', 'CELL_ADMIN'].includes(session?.user?.role || '')) {
        redirect("/dashboard")
    }

    const user = session!.user

    // Aggregate data for the report
    const villages = await prisma.village.findMany({
        include: {
            users: { select: { id: true, name: true, role: true } },
            reports: { take: 5, orderBy: { createdAt: 'desc' } }
        }
    })

    const totalMembers = await prisma.user.count({ where: { role: 'MEMBER' } })
    const totalContribution = await prisma.contribution.aggregate({ _sum: { amount: true } })

    const date = new Date().toLocaleDateString('en-RW', { dateStyle: 'long' })

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="flex items-center justify-between no-print">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-slate-800">Automated Monthly Report</h1>
                    <p className="text-slate-500">Official performance analysis for Niboye Sector.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">
                        <Printer className="w-4 h-4" /> Print Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90">
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                </div>
            </div>

            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 space-y-12 print:shadow-none print:border-none">
                {/* Report Header */}
                <div className="flex items-start justify-between border-b pb-8 border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white">
                            <FileText className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-tight">NIBOYE SECTOR PROTOCOL</h2>
                            <p className="text-sm font-bold text-primary tracking-widest uppercase">FPR Management System</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Report Date</p>
                        <p className="text-sm font-bold text-slate-800">{date}</p>
                    </div>
                </div>

                {/* Executive Summary */}
                <section className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">01. Executive Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Membership</p>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                <span className="text-2xl font-black text-slate-800">{totalMembers.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Collections</p>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                <span className="text-2xl font-black text-slate-800">{totalContribution._sum.amount?.toLocaleString() || 0} RWF</span>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Village Units</p>
                            <div className="flex items-center gap-2">
                                <Building className="w-5 h-5 text-primary" />
                                <span className="text-2xl font-black text-slate-800">{villages.length}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Village Performance Table */}
                <section className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">02. Village Performance Breakdown</h3>
                    <div className="overflow-hidden border border-slate-100 rounded-xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Village Name</th>
                                    <th className="px-6 py-4">Member Count</th>
                                    <th className="px-6 py-4">Recent Reports</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {villages.map(v => (
                                    <tr key={v.id}>
                                        <td className="px-6 py-4 font-bold text-slate-700">{v.name}</td>
                                        <td className="px-6 py-4">{v.users.length}</td>
                                        <td className="px-6 py-4 text-slate-500">{v.reports.length} files</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase rounded">Active</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Footer */}
                <div className="pt-12 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400 leading-relaxed max-w-sm">
                        This is a system-generated document. Any discrepancies should be reported to the Sector IT Administrator.
                    </div>
                    <div className="text-right">
                        <div className="w-32 h-12 border-b border-slate-300 ml-auto mb-2"></div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Authorized Signature</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
