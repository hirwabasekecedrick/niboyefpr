'use client'

import { useEffect } from 'react'
import { updateLastSeen } from '@/app/actions/village-leader'

export function ActiveStatusTracker() {
    useEffect(() => {
        // Update immediately on mount
        updateLastSeen()

        // Update every 3 minutes
        const interval = setInterval(() => {
            updateLastSeen()
        }, 180000)

        return () => clearInterval(interval)
    }, [])

    return null
}
