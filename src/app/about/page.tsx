import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b border-red-100 bg-white shadow-sm">
                <Link className="flex items-center justify-center font-bold text-xl tracking-tight text-primary gap-2" href="/">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <span>Niboye Sector FPR</span>
                </Link>
            </header>
            <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
                <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline mb-8">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>
                <h1 className="text-4xl font-bold text-slate-900 mb-6">About Us</h1>
                <div className="prose prose-slate max-w-none bg-white p-8 rounded-xl border shadow-sm">
                    <p className="text-slate-600 mb-4">
                        The FPR Inkotanyi Management System for the Niboye Sector represents a modern, digital approach to community organization and administration. Our mission is to streamline operations, enhance communication, and foster transparent interactions across all levels of leadership.
                    </p>
                    <p className="text-slate-600">
                        Built with security and scalability in mind, this unified platform ensures that Sector Administrators, Cell Coordinators, Village Leaders, and all members have a synchronized, reliable tool at their disposal to elevate their daily operations.
                    </p>
                </div>
            </main>
        </div>
    );
}
