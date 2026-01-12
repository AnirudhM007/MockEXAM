import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking question distribution...");

    const allQuestions = await prisma.question.findMany({
        select: {
            module: true
        }
    });

    const counts: Record<string, number> = {};
    allQuestions.forEach(q => {
        const m = q.module || 'Unknown';
        counts[m] = (counts[m] || 0) + 1;
    });

    console.log("Module Counts:", counts);

    // Simulate API logic
    const testModules = ['ExamTopic2'];
    console.log(`Testing filtering for: ${testModules.join(', ')}`);

    const filteredQuestions = await prisma.question.findMany({
        where: {
            module: { in: testModules }
        },
        select: {
            id: true,
            module: true
        }
    });

    console.log(`Found ${filteredQuestions.length} questions.`);
    const leaky = filteredQuestions.filter(q => !testModules.includes(q.module!));

    if (leaky.length > 0) {
        console.error("ERROR: Leaky filter! Found questions from other modules:", leaky.map(q => q.module));
    } else {
        console.log("SUCCESS: Filter seems strict.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
