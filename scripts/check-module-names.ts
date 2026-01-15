import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Get all unique module names from database
    const questions = await prisma.question.findMany({
        select: {
            module: true
        },
        distinct: ['module']
    });

    console.log("=== Unique Module Names in Database ===\n");
    questions.forEach(q => {
        console.log(`"${q.module}"`);
    });

    console.log("\n=== Module Name Comparison ===");
    const targetModule = "Evading IDS, Firewalls, and Honeypots";
    console.log(`Looking for: "${targetModule}"`);

    const exactMatch = questions.find(q => q.module === targetModule);
    console.log(`Exact match found: ${exactMatch ? 'YES' : 'NO'}`);

    if (!exactMatch) {
        console.log("\nSimilar modules:");
        questions.forEach(q => {
            if (q.module?.toLowerCase().includes('evading') ||
                q.module?.toLowerCase().includes('ids') ||
                q.module?.toLowerCase().includes('firewall')) {
                console.log(`  - "${q.module}"`);
            }
        });
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
