// Check which module the "passive reconnaissance" question belongs to
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkQuestion() {
    const question = await prisma.question.findFirst({
        where: {
            text: {
                contains: 'passive reconnaissance technique'
            }
        },
        select: {
            id: true,
            text: true,
            module: true
        }
    });

    if (question) {
        console.log('\nQuestion found:');
        console.log('Text:', question.text);
        console.log('Module:', question.module);
    } else {
        console.log('Question not found');
    }

    await prisma.$disconnect();
}

checkQuestion();
