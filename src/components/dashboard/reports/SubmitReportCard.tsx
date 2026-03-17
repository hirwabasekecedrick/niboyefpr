'use client'

import { useState, useTransition } from 'react'
import { submitReport } from '@/app/actions/reports'
import { FileText, Camera, Loader2, CheckCircle2 } from 'lucide-react'

export function SubmitReportCard() {
    const [isPending, startTransition] = useTransition()
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const res = await submitReport(formData)
            if (res.success) {
                setSuccess(true)
                setImagePreview(null)
                    ; (e.target as HTMLFormElement).reset()
                setTimeout(() => setSuccess(false), 5000)
            }
        })
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                New Report
            </h2>

            {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-100 rounded-md flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Report submitted successfully!
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                    <input
                        name="title"
                        required
                        className="w-full h-10 px-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        placeholder="Activity or Performance report title"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Details</label>
                    <textarea
                        name="content"
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        placeholder="Provide detailed information..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Attach Evidence (Image)</label>
                    <div className="relative group">
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 group-hover:border-primary/50 transition-colors bg-slate-50">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-md" />
                            ) : (
                                <>
                                    <Camera className="w-8 h-8 text-slate-400" />
                                    <p className="text-xs text-slate-500">Click to upload or drag and drop</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    disabled={isPending}
                    className="w-full bg-primary text-white py-2 rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Report'}
                </button>
            </form>
        </div>
    )
}
