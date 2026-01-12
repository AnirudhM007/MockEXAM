import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    await prisma.exam.upsert({
        where: { name: 'CEH' },
        update: {},
        create: {
            name: 'CEH',
            description: 'Certified Ethical Hacker',
        },
    })
    // Use ISC2_CC to match the ID/name used in code, label can be prettier
    await prisma.exam.upsert({
        where: { name: 'ISC2_CC' },
        update: {},
        create: {
            name: 'ISC2_CC',
            description: 'Certified in Cybersecurity',
        },
    })
    console.log('Seeding complete.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
