'use server'

import fs from 'fs'
import path from 'path'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export type AutomatedReport = {
    id: string
    level: string
    frequency: string
    date: string
    scopeId: string
    scopeName: string
    sectorId?: string
    cellId?: string
    metrics: {
        totalMembers: number
        totalActivities: number
        totalAttendance?: number
        totalContributions?: number
    }
}

export async function getAutomatedReports(): Promise<AutomatedReport[]> {
    const session = await getServerSession(authOptions)
    if (!session?.user) return []

    const user = session.user
    const reportsDir = path.join(process.cwd(), 'reports')

    if (!fs.existsSync(reportsDir)) return []

    const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.json'))
    const reports: AutomatedReport[] = []

    for (const file of files) {
        try {
            const rawContent = fs.readFileSync(path.join(reportsDir, file), 'utf8')
            const content = JSON.parse(rawContent) as AutomatedReport

            // Authorization logic
            if (user.role === 'SECTOR_ADMIN') {
                if (content.level === 'SECTOR' && content.scopeId !== user.sectorId) continue
                if (content.level === 'CELL' && content.sectorId !== user.sectorId) continue
                if (content.level === 'VILLAGE' && content.sectorId !== user.sectorId) continue
            }
            if (user.role === 'CELL_ADMIN') {
                if (content.level === 'SECTOR') continue
                if (content.level === 'CELL' && content.scopeId !== user.cellId) continue
                if (content.level === 'VILLAGE' && content.cellId !== user.cellId) continue
            }
            if (user.role === 'VILLAGE_LEADER') {
                if (content.level !== 'VILLAGE') continue
                if (content.scopeId !== user.villageId) continue
            }

            reports.push(content)
        } catch (e) {
            console.error(`Error reading automated report ${file}`, e)
        }
    }

    // Sort by date desc
    return reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
