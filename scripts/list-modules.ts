
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const modules = await prisma.question.findMany({
        select: { module: true },
        distinct: ['module']
    });
    console.log("Modules:", modules.map(m => m.module).filter(Boolean));
}
main().finally(() => prisma.$disconnect());
