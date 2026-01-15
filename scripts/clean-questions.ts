// Enhanced script to clean ALL watermark variations
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Comprehensive watermark patterns
const WATERMARK_PATTERNS = [
    // Main pattern variations
    /Certify For Sure.*?IT (?:Exam )?Certification Dumps.*?\d+/gi,
    /Certify For Sure.*?IT Exam Dumps.*?\d+/gi,
    /The No\.1 IT Certification Dumps/gi,

    // Standalone variations
    /Certify For Sure with IT Exam Dumps \d+/gi,
    /IT Exam Dumps \d+/gi,

    // Page numbers
    /Page \d+ of \d+/gi,

    // Additional common patterns
    /Copyright.*?Certify.*?Dumps/gi,
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
    // Clean up any leftover standalone numbers
    cleaned = cleaned.replace(/\s+\d{1,3}$/, '');
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
    console.log('🧹 Enhanced watermark removal...\n');

    const questions = await prisma.question.findMany();
    console.log(`📊 Processing ${questions.length} questions\n`);

    let cleaned = 0;
    let examples = 0;

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

            // Show examples of changes
            if (examples < 5) {
                const originalOptions = JSON.parse(question.options);
                const newOptions = JSON.parse(cleanedOptions);

                for (let i = 0; i < originalOptions.length; i++) {
                    if (originalOptions[i] !== newOptions[i]) {
                        console.log(`✅ Option cleaned:`);
                        console.log(`   Before: "${originalOptions[i]}"`);
                        console.log(`   After:  "${newOptions[i]}"\n`);
                        examples++;
                        break;
                    }
                }
            }
        }
    }

    console.log(`\n✨ Cleaned ${cleaned} questions!`);
    console.log(`📊 ${questions.length - cleaned} questions unchanged\n`);
}

cleanDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
