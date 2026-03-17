import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Check if Sector already exists
    let sector = await prisma.sector.findUnique({
        where: { name: 'Niboye' }
    })

    if (!sector) {
        // 1. Create Niboye Sector
        sector = await prisma.sector.create({
            data: {
                name: 'Niboye',
            }
        })

        console.log(`Created Sector: ${sector.name}`)

        // 2. Create Cells
        const cellNames = ['Gatare', 'Niboye', 'Nyakabanda']
        for (const cName of cellNames) {
            const cell = await prisma.cell.create({
                data: {
                    name: cName,
                    sectorId: sector.id
                }
            })
            console.log(`Created Cell: ${cell.name}`)

            // 3. Create Sample Villages for each Cell
            const villageNames = [`Amizero (${cName})`, `Ubumwe (${cName})`, `Intwari (${cName})`]
            for (const vName of villageNames) {
                await prisma.village.create({
                    data: {
                        name: vName,
                        cellId: cell.id
                    }
                })
                console.log(`  - Created Village: ${vName}`)
            }
        }

        // 4. Create a default Sector Admin (Password: password123)
        await prisma.user.create({
            data: {
                nationalId: '1199080000000000',
                name: 'Admin Niboye',
                phone: '0780000000',
                passwordHash: '$2b$10$EP/YgM7t3wQBx0mQInXvTu5pYIuJHzOQYq6lSXXW5M8dOQc6Z0uHq', // 'password123' bcrypt hash
                role: 'SECTOR_ADMIN',
                isVerified: true,
                sectorId: sector.id
            }
        })
        console.log('Created Default Sector Admin. ID: 1199080000000000, Pass: password123')
    } else {
        console.log('Seed data already exists.')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
