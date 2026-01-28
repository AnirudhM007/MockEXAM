// Simulate the exact API request for module 12
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simulateAPIRequest() {
    const examName = 'CEH';
    const mode = 'short';
    const modules = 'Evading IDS, Firewalls, and Honeypots'; // Module 12

    console.log('\n=== Simulating API Request ===');
    console.log('examName:', examName);
    console.log('mode:', mode);
    console.log('modules:', modules);
    console.log('');

    try {
        const whereClause: any = { name: examName };

        const exam = await prisma.exam.findUnique({
            where: whereClause,
            include: {
                questions: {
                    where: modules ? {
                        module: { in: modules.split(',').map(m => m.trim()) }
                    } : undefined,
                    select: {
                        id: true,
                        text: true,
                        options: true,
                        correct: true,
                        module: true
                    }
                }
            },
        });

        console.log('Found exam:', exam ? 'YES' : 'NO');
        console.log('Questions found:', exam?.questions.length || 0);

        if (exam?.questions) {
            console.log('\nAll question modules:');
            const moduleCounts: Record<string, number> = {};
            exam.questions.forEach(q => {
                const module = q.module || 'Unknown';
                moduleCounts[module] = (moduleCounts[module] || 0) + 1;
            });
            Object.entries(moduleCounts).forEach(([mod, count]) => {
                console.log(`  - ${mod}: ${count} questions`);
            });

            // Shuffle
            let questions = exam.questions.sort(() => Math.random() - 0.5);

            // Limit based on mode
            let limit = questions.length;
            if (mode === 'short') limit = 15;

            const selectedQuestions = questions.slice(0, limit);
            console.log(`\nAfter applying "${mode}" mode limit of ${limit}:`);
            console.log(`Selected ${selectedQuestions.length} questions`);
        }

    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
    } finally {
        await prisma.$disconnect();
    }
}

simulateAPIRequest();
