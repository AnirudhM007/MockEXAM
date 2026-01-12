
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking Module Distribution...");
    const questions = await prisma.question.groupBy({
        by: ['module'],
        _count: {
            id: true
        }
    });

    // Sort by count
    questions.sort((a, b) => b._count.id - a._count.id);

    console.log("Question Count per Module:");
    questions.forEach(q => {
        console.log(`[${q._count.id}] ${q.module}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
