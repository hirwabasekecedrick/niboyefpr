'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Printer, Download, QrCode } from 'lucide-react'
import { useRef } from 'react'

interface EventQRCodeProps {
    activityId: string;
    activityTitle: string;
    activityDate: string;
}

export function EventQRCode({ activityId, activityTitle, activityDate }: EventQRCodeProps) {
    const printRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        const printContent = printRef.current;
        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print' + uniqueName;
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        if (printWindow && printContent) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print QR Code - ${activityTitle}</title>
                        <style>
                            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                            .container { border: 2px solid #ef4444; padding: 40px; border-radius: 20px; text-align: center; }
                            h1 { color: #ef4444; margin-bottom: 10px; }
                            p { color: #64748b; margin-bottom: 30px; }
                            .footer { margin-top: 30px; font-size: 12px; color: #94a3b8; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>${activityTitle}</h1>
                            <p>Event Date: ${new Date(activityDate).toLocaleDateString()}</p>
                            ${printContent.innerHTML}
                            <p style="margin-top: 20px; font-weight: bold;">SCAN TO MARK ATTENDANCE</p>
                            <div class="footer">Niboye Sector FPR Management System</div>
                        </div>
                        <script>
                            window.onload = function() { window.print(); window.close(); }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
        }
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-primary" />
                Event QR Code
            </h3>

            <div ref={printRef} className="p-4 bg-white border-4 border-red-50 rounded-xl mb-4">
                <QRCodeSVG
                    value={activityId}
                    size={200}
                    level="H"
                    includeMargin={true}
                />
            </div>

            <p className="text-xs text-slate-400 text-center mb-6 max-w-[200px]">
                Members can scan this code using their smartphones to record attendance digitaly.
            </p>

            <div className="grid grid-cols-2 gap-2 w-full">
                <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg text-xs font-bold transition-colors"
                >
                    <Printer className="w-3.5 h-3.5" />
                    Print Code
                </button>
                <button
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors"
                >
                    <Download className="w-3.5 h-3.5" />
                    Save Image
                </button>
            </div>
        </div>
    )
}
