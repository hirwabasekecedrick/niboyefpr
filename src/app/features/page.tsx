import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function FeaturesPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b border-red-100 bg-white shadow-sm">
                <Link className="flex items-center justify-center font-bold text-xl tracking-tight text-primary gap-2" href="/">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <span>Niboye Sector FPR</span>
                </Link>
            </header>
            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline mb-8">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>
                <h1 className="text-4xl font-bold text-slate-900 mb-6">System Features</h1>
                <p className="text-slate-600 mb-8 leading-relaxed">
                    The FPR Inkotanyi Management System is designed to empower local administration from the village up to the sector level.
                    Here are some of the key features included in the platform:
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="text-lg font-bold mb-2 text-slate-800">Member Management</h3>
                        <p className="text-slate-600 text-sm">Efficiently register securely lookup records, and verify members at every administrative level.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="text-lg font-bold mb-2 text-slate-800">Contributions Tracking</h3>
                        <p className="text-slate-600 text-sm">Cell and Sector admins can securely record and view monetary contributions securely over time.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="text-lg font-bold mb-2 text-slate-800">Activities & Attendance</h3>
                        <p className="text-slate-600 text-sm">Schedule events and seamlessly track member attendance for community activities.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="text-lg font-bold mb-2 text-slate-800">Data & Automated Reports</h3>
                        <p className="text-slate-600 text-sm">Gain insights into community engagement through comprehensive dashboards and data exports.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
