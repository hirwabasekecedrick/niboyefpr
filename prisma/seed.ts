import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10);
    // 1. Ensure Niboye Sector exists
    let sector = await prisma.sector.findUnique({ where: { name: 'Niboye' } })
    if (!sector) {
        sector = await prisma.sector.create({ data: { name: 'Niboye' } })
    }
    console.log(`Sector: ${sector.name}`)

    // 2. Ensure Cells and Villages exist
    const cellNames = ['Gatare', 'Niboye', 'Nyakabanda']
    for (const cName of cellNames) {
        let cell = await prisma.cell.findFirst({
            where: { name: cName, sectorId: sector.id }
        })
        if (!cell) {
            cell = await prisma.cell.create({
                data: { name: cName, sectorId: sector.id }
            })
        }
        console.log(`Cell: ${cell.name}`)

        const villageNames = [`Amizero (${cName})`, `Ubumwe (${cName})`, `Intwari (${cName})`]
        for (const vName of villageNames) {
            const village = await prisma.village.findFirst({
                where: { name: vName, cellId: cell.id }
            })
            if (!village) {
                await prisma.village.create({
                    data: { name: vName, cellId: cell.id }
                })
            }
        }
    }

    const nyakabandaCell = await prisma.cell.findFirst({ where: { name: 'Nyakabanda', sectorId: sector.id } });

    // 4. Create a default Sector Admin (Password: password123)
    await prisma.user.upsert({
        where: { nationalId: '1199080000000000' },
        update: { passwordHash: passwordHash },
        create: {
            nationalId: '1199080000000000',
            name: 'Admin Niboye',
            phone: '0780000000',
            passwordHash: passwordHash,
            role: 'SECTOR_ADMIN',
            isVerified: true,
            sectorId: sector.id
        }
    })
    console.log('Ensured Default Sector Admin exists.')

    // 5. Create a default Cell Admin (Password: password123)
    if (nyakabandaCell) {
        await prisma.user.upsert({
            where: { nationalId: '1199080000000001' },
            update: { passwordHash: passwordHash },
            create: {
                nationalId: '1199080000000001',
                name: 'Admin Nyakabanda',
                phone: '0780000001',
                passwordHash: passwordHash,
                role: 'CELL_ADMIN',
                isVerified: true,
                sectorId: sector.id,
                cellId: nyakabandaCell.id
            }
        })
        console.log('Ensured Default Cell Admin (Nyakabanda) exists.')

        const amizeroVillage = await prisma.village.findFirst({
            where: { name: 'Amizero (Nyakabanda)', cellId: nyakabandaCell.id }
        })

        if (amizeroVillage) {
            await prisma.user.upsert({
                where: { nationalId: '1199080000000002' },
                update: { passwordHash: passwordHash },
                create: {
                    nationalId: '1199080000000002',
                    name: 'Leader Amizero',
                    phone: '0780000002',
                    passwordHash: passwordHash,
                    role: 'VILLAGE_LEADER',
                    isVerified: true,
                    sectorId: sector.id,
                    cellId: nyakabandaCell.id,
                    villageId: amizeroVillage.id
                }
            })
            console.log('Ensured Default Village Leader (Amizero) exists.')
        }
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
