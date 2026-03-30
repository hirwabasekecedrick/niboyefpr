'use client'

import { useState, useTransition } from 'react'
import { Camera, Loader2, User as UserIcon } from 'lucide-react'
import { updateProfilePicture } from '@/app/actions/profile'

export function ProfilePictureUpload({ initialImage }: { initialImage: string | null }) {
    const [isPending, startTransition] = useTransition()
    const [isUploading, setIsUploading] = useState(false)
    const [preview, setPreview] = useState(initialImage)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()

            if (data.success) {
                const newUrl = data.url
                setPreview(newUrl)

                startTransition(async () => {
                    await updateProfilePicture(newUrl)
                })
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-white border-2 border-primary shadow-sm flex items-center justify-center text-primary overflow-hidden">
                {preview ? (
                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <UserIcon className="w-10 h-10" />
                )}

                {(isUploading || isPending) && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                )}
            </div>

            <label className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer shadow-md hover:bg-primary/90 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={isUploading || isPending}
                />
            </label>
        </div>
    )
}
