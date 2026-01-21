// Find questions that reference missing content
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findIncompleteQuestions() {
    // Patterns that indicate missing content
    const patterns = [
        'given below',
        'shown below',
        'following exhibit',
        'above figure',
        'examine the',
        'study the',
        'refer to the',
        'based on the exhibit',
        'screenshot',
        'diagram',
        'code snippet',
        'image shows',
    ];

    const questions = await prisma.question.findMany({
        where: {
            exam: { name: 'CEH' }
        },
        select: {
            id: true,
            text: true,
            module: true,
            correct: true
        }
    });

    console.log(`\n=== Scanning ${questions.length} questions for missing context ===\n`);

    const flagged: Array<{ id: string; text: string; module: string; reason: string }> = [];

    questions.forEach(q => {
        const lowerText = q.text.toLowerCase();

        for (const pattern of patterns) {
            if (lowerText.includes(pattern)) {
                flagged.push({
                    id: q.id,
                    text: q.text.substring(0, 100) + '...',
                    module: q.module || 'Unknown',
                    reason: `Contains "${pattern}"`
                });
                break; // Only flag once per question
            }
        }
    });

    console.log(`Found ${flagged.length} potentially incomplete questions:\n`);

    // Group by module
    const byModule: Record<string, number> = {};
    flagged.forEach(q => {
        byModule[q.module] = (byModule[q.module] || 0) + 1;
    });

    console.log('Breakdown by module:');
    Object.entries(byModule)
        .sort((a, b) => b[1] - a[1])
        .forEach(([module, count]) => {
            console.log(`  ${module}: ${count} questions`);
        });

    console.log('\nFirst 10 examples:');
    flagged.slice(0, 10).forEach((q, i) => {
        console.log(`\n${i + 1}. [${q.module}]`);
        console.log(`   ${q.text}`);
        console.log(`   Reason: ${q.reason}`);
        console.log(`   ID: ${q.id}`);
    });

    // Save to file for review
    const fs = require('fs');
    fs.writeFileSync(
        'incomplete-questions-report.json',
        JSON.stringify(flagged, null, 2)
    );

    console.log(`\n✅ Full report saved to: incomplete-questions-report.json`);
    console.log(`Total flagged: ${flagged.length} / ${questions.length} (${((flagged.length / questions.length) * 100).toFixed(1)}%)`);

    await prisma.$disconnect();
}

findIncompleteQuestions();
