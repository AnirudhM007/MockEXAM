import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyContext() {
    console.log('=== Verifying Database Content ===\n');

    const totalQuestions = await prisma.question.count({
        where: { exam: { name: 'CEH' } }
    });
    console.log(`Total Questions: ${totalQuestions}`);

    const questionsWithContext = await prisma.question.findMany({
        where: {
            exam: { name: 'CEH' },
            hasContext: true
        },
        include: { contexts: true }
    });

    console.log(`Questions with Context: ${questionsWithContext.length}`);

    if (questionsWithContext.length > 0) {
        console.log('\n--- Context Details ---');
        questionsWithContext.forEach((q, i) => {
            console.log(`\n${i + 1}. Question ID: ${q.id}`);
            console.log(`   Text: ${q.text.substring(0, 80)}...`);
            console.log(`   Module: ${q.module}`);
            console.log(`   Context Type: ${q.contextType}`);
            q.contexts.forEach((ctx, j) => {
                console.log(`     [${ctx.type}] Position: ${ctx.position}`);
                console.log(`     Content: ${ctx.content.substring(0, 50)}...`);
                if (ctx.metadata) console.log(`     Metadata: ${ctx.metadata}`);
            });
        });
    }

    // Check answerCount distribution
    const counts = await prisma.question.groupBy({
        by: ['answerCount'],
        where: { exam: { name: 'CEH' } },
        _count: {
            id: true
        }
    });

    console.log('\n--- Answer Count Distribution ---');
    counts.forEach(c => {
        console.log(`AnswerCount ${c.answerCount}: ${c._count.id} questions`);
    });

    // Check sample multi-select if any
    const multi = await prisma.question.findFirst({
        where: { answerCount: { gt: 1 } }
    });

    if (multi) {
        console.log('\nSample Multi-select:');
        console.log(`ID: ${multi.id}`);
        console.log(`AnswerCount: ${multi.answerCount}`);
        console.log(`Correct: ${multi.correct}`);
        console.log(`CorrectAnswers JSON: ${multi.correctAnswers}`);
    } else {
        console.log('\nNo multi-select questions found in DB.');
    }
}

verifyContext()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
