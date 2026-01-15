import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const questions = await prisma.question.findMany({
        take: 5
    });

    let output = "Sample questions to check for watermarks:\n\n";
    questions.forEach((q, i) => {
        output += `\n=== Question ${i + 1} ===\n`;
        output += `Module: ${q.module}\n`;
        output += `Full Text:\n${q.text}\n`;
        output += "=".repeat(80) + "\n";
    });

    fs.writeFileSync('watermark-check.txt', output);
    console.log("Wrote sample questions to watermark-check.txt");
    console.log(output);
}

main().catch(console.error).finally(() => prisma.$disconnect());
