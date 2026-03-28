import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const REPORTS_DIR = path.join(process.cwd(), 'reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

export async function generateReport(frequency: 'daily' | 'weekly' | 'monthly') {
    console.log(`[CRON] Generating ${frequency} reports...`);
    const dateStr = new Date().toISOString().split('T')[0];

    try {
        // Sector Level Report
        const sectors = await prisma.sector.findMany({
            include: { cells: true }
        });

        for (const sector of sectors) {
            const sectorMembers = await prisma.user.count({ where: { sectorId: sector.id, role: 'MEMBER' } });
            const sectorActivities = await prisma.activity.count({ where: { author: { sectorId: sector.id } } });
            const sectorContributions = await prisma.contribution.aggregate({
                where: { member: { sectorId: sector.id } },
                _sum: { amount: true }
            });

            const reportData = {
                id: `sector-${sector.id}-${frequency}-${dateStr}`,
                level: 'SECTOR',
                frequency,
                date: new Date().toISOString(),
                scopeId: sector.id,
                scopeName: sector.name,
                metrics: {
                    totalMembers: sectorMembers,
                    totalActivities: sectorActivities,
                    totalContributions: sectorContributions._sum.amount || 0,
                }
            };

            const fileName = `SECTOR_${sector.name.replace(/\s+/g, '_')}_${frequency}_${dateStr}.json`;
            fs.writeFileSync(path.join(REPORTS_DIR, fileName), JSON.stringify(reportData, null, 2));
        }

        // Cell Level Reports
        const cells = await prisma.cell.findMany();

        for (const cell of cells) {
            const cellMembers = await prisma.user.count({ where: { cellId: cell.id, role: 'MEMBER' } });
            const cellActivities = await prisma.activity.count({ where: { author: { cellId: cell.id } } });
            const cellContributions = await prisma.contribution.aggregate({
                where: { member: { cellId: cell.id } },
                _sum: { amount: true }
            });

            const reportData = {
                id: `cell-${cell.id}-${frequency}-${dateStr}`,
                level: 'CELL',
                frequency,
                date: new Date().toISOString(),
                scopeId: cell.id,
                scopeName: cell.name,
                sectorId: cell.sectorId,
                metrics: {
                    totalMembers: cellMembers,
                    totalActivities: cellActivities,
                    totalContributions: cellContributions._sum.amount || 0,
                }
            };

            const fileName = `CELL_${cell.name.replace(/\s+/g, '_')}_${frequency}_${dateStr}.json`;
            fs.writeFileSync(path.join(REPORTS_DIR, fileName), JSON.stringify(reportData, null, 2));
        }

        // Village Level Reports
        const villages = await prisma.village.findMany({
            include: { cell: true }
        });

        for (const village of villages) {
            const villageMembers = await prisma.user.count({ where: { villageId: village.id, role: 'MEMBER' } });
            const villageActivities = await prisma.activity.count({
                where: { OR: [{ author: { villageId: village.id } }, { level: 'VILLAGE' }] }
            });
            const villageContributions = await prisma.contribution.aggregate({
                where: { member: { villageId: village.id } },
                _sum: { amount: true }
            });

            const reportData = {
                id: `village-${village.id}-${frequency}-${dateStr}`,
                level: 'VILLAGE',
                frequency,
                date: new Date().toISOString(),
                scopeId: village.id,
                scopeName: village.name,
                cellId: village.cellId,
                sectorId: village.cell.sectorId,
                metrics: {
                    totalMembers: villageMembers,
                    totalActivities: villageActivities,
                    totalContributions: villageContributions._sum.amount || 0,
                }
            };

            const fileName = `VILLAGE_${village.name.replace(/\s+/g, '_')}_${frequency}_${dateStr}.json`;
            fs.writeFileSync(path.join(REPORTS_DIR, fileName), JSON.stringify(reportData, null, 2));
        }

        console.log(`[CRON] ${frequency} reports generated successfully.`);
    } catch (error) {
        console.error(`[CRON] Error generating ${frequency} reports:`, error);
    }
}

// Daily at midnight
cron.schedule('0 0 * * *', () => {
    generateReport('daily');
});

// Weekly on Sunday at midnight
cron.schedule('0 0 * * 0', () => {
    generateReport('weekly');
});

// Monthly on the 1st day of the month at midnight
cron.schedule('0 0 1 * *', () => {
    generateReport('monthly');
});

console.log('[CRON] Reporting service started. Awaiting schedule...');

// For testing purposes, uncomment to run immediately on startup
// generateReport('daily');
