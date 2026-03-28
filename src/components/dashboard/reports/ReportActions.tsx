'use client'

import { Printer, Download } from "lucide-react"

export function ReportActions() {
    return (
        <div className="flex gap-2 no-print">
            <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
                <Printer className="w-4 h-4" /> Print Report
            </button>
            <button
                onClick={() => alert('Export to PDF functionality would integrate with a library like jspdf or a server-side PDF generator.')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-95"
            >
                <Download className="w-4 h-4" /> Export PDF
            </button>
        </div>
    )
}
