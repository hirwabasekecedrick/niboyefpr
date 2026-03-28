import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
                <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline mb-8">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>
                <h1 className="text-4xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
                <div className="bg-white p-8 rounded-xl border shadow-sm text-slate-600 space-y-4">
                    <p>
                        Your privacy is critically important to us. This policy outlines how the FPR Inkotanyi Management System collects, utilizes, and protects your personal information.
                    </p>
                    <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-2">Data Collection</h2>
                    <p>
                        We collect essential demographic information, national IDs, and operational data (such as attendance and monetary contributions) solely to facilitate community administration operations.
                    </p>
                    <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-2">Data Protection</h2>
                    <p>
                        All sensitive data, including passwords, are heavily encrypted. System access is governed by strict role-based access control (RBAC), ensuring that only authorized individuals can view specific records.
                    </p>
                    <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-2">Information Sharing</h2>
                    <p>
                        We do not sell, distribute, or lease personal information to any third parties without explicit consent, except as required by national law.
                    </p>
                    <p className="text-sm mt-8 border-t pt-4">Last Updated: March 2026</p>
                </div>
            </main>
        </div>
    );
}
