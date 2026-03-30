'use client'

import { useState, useTransition } from 'react'
import { updateEventDetails } from '@/app/actions/activities'
import { Camera, Save, Loader2, X, Image as ImageIcon } from 'lucide-react'

export function EventEditor({
    activityId,
    initialNotes,
    initialPhotos
}: {
    activityId: string
    initialNotes: string | null
    initialPhotos: string[]
}) {
    const [isPending, startTransition] = useTransition()
    const [notes, setNotes] = useState(initialNotes || '')
    const [photos, setPhotos] = useState<string[]>(initialPhotos || [])
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState('')

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setError('')

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()

            if (data.success) {
                setPhotos(prev => [...prev, data.url])
            } else {
                setError(data.error || 'Failed to upload photo')
            }
        } catch (err: any) {
            setError(err.message || 'Error uploading photo')
        } finally {
            setIsUploading(false)
        }
    }

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index))
    }

    const saveDetails = () => {
        setError('')
        startTransition(async () => {
            const res = await updateEventDetails(activityId, notes, photos)
            if (!res.success) {
                setError(res.error || 'Failed to save event details')
            } else {
                alert('Event details saved successfully!')
            }
        })
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm mt-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                Event Media & Notes
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        placeholder="Add private notes about the event..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Photos</label>

                    {photos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                            {photos.map((url, idx) => (
                                <div key={idx} className="relative group rounded-md overflow-hidden bg-slate-100 aspect-video border border-slate-200">
                                    <img src={url} alt={`Event photo ${idx + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(idx)}
                                        className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium cursor-pointer transition-colors w-fit">
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                            {isUploading ? 'Uploading...' : 'Upload Photo'}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={isUploading || isPending}
                            />
                        </label>
                    </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={saveDetails}
                        disabled={isPending || isUploading}
                        className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
