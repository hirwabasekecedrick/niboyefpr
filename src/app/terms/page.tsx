import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
                <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline mb-8">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>
                <h1 className="text-4xl font-bold text-slate-900 mb-6">Terms of Service</h1>
                <div className="bg-white p-8 rounded-xl border shadow-sm text-slate-600 space-y-4">
                    <p>
                        Welcome to the FPR Inkotanyi Management System. By accessing or using our platform, you agree to be bound by these functional Terms of Service.
                    </p>
                    <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-2">1. Acceptance of Terms</h2>
                    <p>
                        By registering an account, you affirm that you are authorized to access the system and agree to act in accordance with local regulations and organizational guidelines.
                    </p>
                    <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-2">2. User Responsibilities</h2>
                    <p>
                        Users are solely responsible for securely maintaining their credentials and ensuring the accurate entry of details, including financial contributions and personal data.
                    </p>
                    <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-2">3. System Availability</h2>
                    <p>
                        While we strive for 100% uptime, modifications, updates, and maintenance may occasionally interrupt service. We bear no liability for scheduled downtimes.
                    </p>
                    <p className="text-sm mt-8 border-t pt-4">Last Updated: March 2026</p>
                </div>
            </main>
        </div>
    );
}
