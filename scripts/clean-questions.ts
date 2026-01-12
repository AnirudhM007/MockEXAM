// Safe script to clean question text only - no deletions
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Watermark patterns
const WATERMARK_PATTERNS = [
    /Certify For Sure.*?IT Certification Dumps.*?\d+/gi,
    /The No\.1 IT Certification Dumps/gi,
    /Page \d+ of \d+/gi,
];

function fixEncoding(text: string): string {
    let fixed = text.replace(/""([^"]+)""/g, '"$1"');
    fixed = fixed.replace(/[""]/g, '"');
    fixed = fixed.replace(/['']/g, "'");
    return fixed;
}

function removeWatermarks(text: string): string {
    let cleaned = text;
    for (const pattern of WATERMARK_PATTERNS) {
        cleaned = cleaned.replace(pattern, '');
    }
    return cleaned.trim();
}

function cleanText(text: string): string {
    let cleaned = removeWatermarks(text);
    cleaned = fixEncoding(cleaned);
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
}

function cleanOptionsString(optionsStr: string): string {
    try {
        const options = JSON.parse(optionsStr);
        const cleaned = options.map((opt: string) => cleanText(opt));
        return JSON.stringify(cleaned);
    } catch {
        return optionsStr;
    }
}

async function cleanDatabase() {
    console.log('🧹 Cleaning questions (text only, no deletions)...\n');

    const questions = await prisma.question.findMany();
    console.log(`📊 Processing ${questions.length} questions\n`);

    let cleaned = 0;

    for (const question of questions) {
        const cleanedText = cleanText(question.text);
        const cleanedOptions = cleanOptionsString(question.options);

        if (cleanedText !== question.text || cleanedOptions !== question.options) {
            await prisma.question.update({
                where: { id: question.id },
                data: {
                    text: cleanedText,
                    options: cleanedOptions,
                },
            });

            cleaned++;
            if (cleaned <= 3) {
                console.log(`✅ Cleaned: "${question.text.substring(0, 50)}..."`);
                console.log(`   →: "${cleanedText.substring(0, 50)}..."\n`);
            }
        }
    }

    console.log(`\n✨ Cleaned ${cleaned} questions!`);
}

cleanDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
