import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
            <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Welcome to Dashboard</h1>
                <p className="text-slate-500 mb-6">Your registration was successful. The dashboard features (Phases 2-5) will be implemented shortly.</p>

                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors w-full"
                >
                    <ArrowLeft className="w-4 h-4" /> Go back Home
                </Link>
            </div>
        </div>
    )
}
