
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targetModules = ["IoT Hacking", "Hacking Web Applications", "Hacking Mobile Platforms", "Denial-of-Service"];

    for (const mod of targetModules) {
        console.log(`\n=== INSPECTING: ${mod} ===`);
        const questions = await prisma.question.findMany({
            where: { module: mod },
            select: { text: true }
        });

        if (questions.length === 0) console.log("No questions found.");

        questions.forEach((q, i) => {
            console.log(`[${i + 1}] ${q.text.substring(0, 150)}...`);
        });
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
