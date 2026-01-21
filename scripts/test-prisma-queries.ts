// Test different Prisma query approaches
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testQueries() {
    const moduleName = 'Evading IDS, Firewalls, and Honeypots';

    console.log('\n=== Testing Different Query Approaches ===\n');

    // Approach 1: Direct module filter (not nested)
    console.log('Approach 1: Direct question query...');
    const direct = await prisma.question.findMany({
        where: {
            exam: { name: 'CEH' },
            module: moduleName
        },
        select: { id: true, module: true }
    });
    console.log(`Result: ${direct.length} questions\n`);

    // Approach 2: Using 'in' with array
    console.log('Approach 2: Using { in: [moduleName] }...');
    const withIn = await prisma.question.findMany({
        where: {
            exam: { name: 'CEH' },
            module: { in: [moduleName] }
        },
        select: { id: true, module: true }
    });
    console.log(`Result: ${withIn.length} questions\n`);

    // Approach 3: Nested in exam query (current approach)
    console.log('Approach 3: Nested in exam.include...');
    const nested = await prisma.exam.findUnique({
        where: { name: 'CEH' },
        include: {
            questions: {
                where: {
                    module: { in: [moduleName] }
                },
                select: { id: true, module: true }
            }
        }
    });
    console.log(`Result: ${nested?.questions.length || 0} questions\n`);

    await prisma.$disconnect();
}

testQueries();
