'use client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Download } from 'lucide-react'
import { AutomatedReport } from '@/app/actions/automatedReports'
import { useState } from 'react'

export function DownloadPdfButton({ report }: { report: AutomatedReport }) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleDownload = () => {
        setIsGenerating(true)

        try {
            const doc = new jsPDF()

            // Header
            doc.setFontSize(20)
            doc.setTextColor(40, 40, 40)
            doc.text('Niboye Sector FPR', 14, 22)

            doc.setFontSize(12)
            doc.setTextColor(100, 100, 100)
            doc.text('Automated System Report', 14, 30)

            // Report Info
            doc.setFontSize(11)
            doc.setTextColor(60, 60, 60)
            const dateStr = new Date(report.date).toLocaleDateString()
            doc.text(`Scope: ${report.scopeName} (${report.level})`, 14, 45)
            doc.text(`Frequency: ${report.frequency.toUpperCase()}`, 14, 52)
            doc.text(`Generation Date: ${dateStr}`, 14, 59)

            // Table
            autoTable(doc, {
                startY: 70,
                head: [['Metric', 'Value']],
                body: [
                    ['Total Membership', report.metrics.totalMembers.toLocaleString()],
                    ['Total Activities Held', report.metrics.totalActivities.toLocaleString()],
                    ['Total Monetary Contributions', `${report.metrics.totalContributions.toLocaleString()} RWF`],
                ],
                theme: 'striped',
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                styles: { fontSize: 11, cellPadding: 6 },
            })

            // Footer
            const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight()
            doc.setFontSize(9)
            doc.setTextColor(150, 150, 150)
            doc.text('Confidential Document - FPR Inkotanyi Management System', 14, pageHeight - 10)

            // Save PDF
            doc.save(`${report.id}.pdf`)
        } catch (error) {
            console.error('Failed to generate PDF:', error)
            alert('Failed to generate PDF report.')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors text-xs font-bold uppercase rounded-md disabled:opacity-50"
        >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Download PDF'}
        </button>
    )
}
