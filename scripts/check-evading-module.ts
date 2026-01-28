// Check exact module names for "Evading IDS" module
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkModuleNames() {
    try {
        // Get questions for the specific module
        const questions = await prisma.question.findMany({
            where: {
                exam: {
                    name: 'CEH'
                },
                module: {
                    contains: 'Evading'
                }
            },
            select: {
                id: true,
                module: true,
                text: true
            }
        });

        console.log(`\nFound ${questions.length} questions with "Evading" in module name\n`);

        if (questions.length > 0) {
            const firstQuestion = questions[0];
            const moduleName = firstQuestion.module || 'undefined';

            console.log('Exact module name in database:');
            console.log(`"${moduleName}"\n`);

            console.log('Module name length:', moduleName.length);
            console.log('Module name bytes:', Buffer.from(moduleName).toString('hex'));

            console.log('\nFirst 3 questions:');
            questions.slice(0, 3).forEach((q, i) => {
                console.log(`${i + 1}. ${q.text.substring(0, 60)}...`);
            });
        }

    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
    } finally {
        await prisma.$disconnect();
    }
}

checkModuleNames();
