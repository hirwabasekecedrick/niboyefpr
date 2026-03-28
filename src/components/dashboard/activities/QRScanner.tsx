'use client'

import { useEffect, useState, useTransition } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { markAttendance } from '@/app/actions/activities'
import { CheckCircle2, AlertCircle, Loader2, Camera } from 'lucide-react'

interface QRScannerProps {
    activityId: string;
    activityTitle: string;
}

export function QRScanner({ activityId, activityTitle }: QRScannerProps) {
    const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null)
    const [isPending, startTransition] = useTransition()
    const [scannerActive, setScannerActive] = useState(false)

    useEffect(() => {
        if (!scannerActive) return;

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText: string) {
            if (decodedText === activityId) {
                scanner.clear();
                setScannerActive(false);
                handleAttendance();
            } else {
                setScanResult('error');
            }
        }

        function onScanFailure(error: any) {
            // Silence scanning errors as they happen constantly
        }

        return () => {
            scanner.clear().catch(err => console.error("Failed to clear scanner", err));
        }
    }, [scannerActive, activityId]);

    function handleAttendance() {
        startTransition(async () => {
            const res = await markAttendance(activityId, 'PRESENT', undefined, true)
            if (res.success) {
                setScanResult('success')
            } else {
                setScanResult('error')
            }
        })
    }

    if (scanResult === 'success') {
        return (
            <div className="bg-green-50 border border-green-200 p-8 rounded-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-green-800">Attendance Recorded!</h3>
                <p className="text-sm text-green-700 mt-2 max-w-xs">
                    Your attendance for <strong>{activityTitle}</strong> has been sent to your Village Leader for final confirmation.
                </p>
                <button
                    onClick={() => setScanResult(null)}
                    className="mt-6 text-sm font-bold text-green-700 hover:underline"
                >
                    Back to detail
                </button>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                Scan to Attend
            </h3>

            {!scannerActive ? (
                <div className="w-full flex flex-col items-center">
                    <div className="w-full aspect-square max-w-[300px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center mb-6 text-slate-400">
                        <Camera className="w-12 h-12 mb-2 opacity-20" />
                        <p className="text-xs font-medium px-8 text-center">Enable your camera to scan the event QR code provided by the leader.</p>
                    </div>
                    <button
                        onClick={() => setScannerActive(true)}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
                    >
                        Start Scanner
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-[400px]">
                    <div id="reader" className="overflow-hidden rounded-xl border border-slate-200"></div>
                    <button
                        onClick={() => setScannerActive(false)}
                        className="w-full mt-4 text-slate-500 text-xs font-bold uppercase tracking-widest py-2"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {isPending && (
                <div className="mt-4 flex items-center gap-2 text-primary font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Processing...</span>
                </div>
            )}

            {scanResult === 'error' && (
                <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-bold">Invalid QR Code. Please try again.</span>
                </div>
            )}
        </div>
    )
}
