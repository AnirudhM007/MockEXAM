
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching 'Introduction to Ethical Hacking' questions...");
    const questions = await prisma.question.findMany({
        where: { module: "Introduction to Ethical Hacking" },
        select: { text: true }
    });

    console.log(`Found ${questions.length} questions. Dumping samples...`);

    // Dump first 50 to console
    const sample = questions.slice(0, 50);
    sample.forEach((q, i) => {
        // Flatten newlines to make it readable
        const clean = q.text.replace(/\r?\n|\r/g, ' ').substring(0, 120);
        console.log(`[${i + 1}] ${clean}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
