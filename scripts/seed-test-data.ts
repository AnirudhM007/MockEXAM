import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData() {
    console.log('=== Seeding Test Data ===\n');

    // 1. Make a question Multi-Select
    const q1 = await prisma.question.findFirst({ where: { exam: { name: 'CEH' } } });
    if (q1) {
        console.log(`Updating Question ${q1.id} to be Multi-Select...`);
        await prisma.question.update({
            where: { id: q1.id },
            data: {
                text: '[TEST MULTI-SELECT] Which of the following are common ports? (Select all that apply)',
                options: JSON.stringify(['A. Port 80', 'B. Port 22', 'C. Port 9999', 'D. Port 443', 'E. Port 12345']),
                answerCount: 3,
                correctAnswers: JSON.stringify(['A. Port 80', 'B. Port 22', 'D. Port 443']),
                correct: 'A, B, D' // Fallback for legacy
            }
        });
        console.log('✅ Updated Q1 to multi-select');
    }

    // 2. Add rich context to another question
    const q2 = await prisma.question.findFirst({
        where: {
            exam: { name: 'CEH' },
            id: { not: q1?.id }
        }
    });

    if (q2) {
        console.log(`Updating Question ${q2.id} with Code Block Context...`);
        await prisma.question.update({
            where: { id: q2.id },
            data: {
                hasContext: true,
                contextType: 'code_block,rule'
            }
        });

        await prisma.questionContext.create({
            data: {
                questionId: q2.id,
                type: 'code_block',
                position: 0,
                content: 'nmap -sS -p 1-65535 -T4 -A -v 192.168.1.1',
                metadata: JSON.stringify({ language: 'bash' })
            }
        });

        await prisma.questionContext.create({
            data: {
                questionId: q2.id,
                type: 'rule',
                position: 1, // After question
                content: 'alert tcp $EXTERNAL_NET any -> $HTTP_SERVERS $HTTP_PORTS (msg:"WEB-ATTACK SQL Injection"; content:"UNION SELECT"; nocase; sid:1001;)',
                metadata: JSON.stringify({ language: 'snort' })
            }
        });
        console.log('✅ Updated Q2 with context (Before & After)');
    }

    // 3. Add Image Context (Placeholder URL)
    const q3 = await prisma.question.findFirst({
        where: {
            exam: { name: 'CEH' },
            id: { notIn: [q1?.id!, q2?.id!] }
        }
    });

    if (q3) {
        console.log(`Updating Question ${q3.id} with Image Context...`);
        await prisma.question.update({
            where: { id: q3.id },
            data: {
                hasContext: true,
                contextType: 'image'
            }
        });

        await prisma.questionContext.create({
            data: {
                questionId: q3.id,
                type: 'image',
                position: 0,
                content: '/placeholder-diagram.png', // We need to ensure this file exists or use a web placeholder
                metadata: JSON.stringify({ alt: 'Network Diagram' })
            }
        });
        console.log('✅ Updated Q3 with Image context');
    }
}

seedTestData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
