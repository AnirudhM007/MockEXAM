// Check question counts per module in the database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkModuleCounts() {
    try {
        // Get all questions grouped by module
        const questions = await prisma.question.findMany({
            where: {
                exam: {
                    name: 'CEH'
                }
            },
            select: {
                module: true
            }
        });

        // Count questions per module
        const moduleCounts: Record<string, number> = {};
        questions.forEach(q => {
            const module = q.module || 'Unknown';
            moduleCounts[module] = (moduleCounts[module] || 0) + 1;
        });

        console.log('\n=== Question Counts by Module ===\n');
        Object.entries(moduleCounts)
            .sort((a, b) => b[1] - a[1]) // Sort by count descending
            .forEach(([module, count]) => {
                console.log(`${module}: ${count} questions`);
            });

        console.log(`\nTotal questions: ${questions.length}`);
        console.log(`Total modules: ${Object.keys(moduleCounts).length}\n`);

    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
    } finally {
        await prisma.$disconnect();
    }
}

checkModuleCounts();
