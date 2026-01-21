// Helper script to add context to the 9 incomplete questions
// This provides a framework for manually adding missing context (code, rules, etc.)
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

// Load the flagged questions
const flaggedQuestions = JSON.parse(
    fs.readFileSync('incomplete-questions-report.json', 'utf-8')
);

console.log(`\n📋 Found ${flaggedQuestions.length} questions needing context\n`);

// Example context data for the flagged questions
// You can manually add the missing snort rules, code snippets, etc. here
const contextData: Record<string, { type: string; content: string; position: number }[]> = {
    // Example: Snort rule question
    'cmkfsd8k10053dsfevjgfkayz': [
        {
            type: 'code_block',
            content: `alert tcp any any -> 192.168.1.0/24 111
(content: "|00 01 86 a5|"; msg: "mountd access";)`,
            position: 0  // 0 = before question text
        }
    ],

    // Add more as needed...
    // 'question-id': [{ type: 'code_block', content: '...', position: 0 }]
};

async function addContextToQuestions() {
    console.log('🔧 Adding context to questions...\n');

    for (const q of flaggedQuestions) {
        const contexts = contextData[q.id];

        if (!contexts) {
            console.log(`⚠️  Skipping ${q.id} - no context data defined yet`);
            continue;
        }

        // Update question to mark it has context
        await prisma.question.update({
            where: { id: q.id },
            data: {
                hasContext: true,
                contextType: contexts.length === 1 ? contexts[0].type : 'mixed'
            }
        });

        // Add context items
        for (const ctx of contexts) {
            await prisma.questionContext.create({
                data: {
                    questionId: q.id,
                    type: ctx.type,
                    content: ctx.content,
                    position: ctx.position,
                    metadata: JSON.stringify({
                        language: ctx.type === 'code_block' ? 'snort' : undefined
                    })
                }
            });
        }

        console.log(`✅ Added context to: ${q.text.substring(0, 60)}...`);
    }

    console.log(`\n✨ Complete! Updated ${Object.keys(contextData).length} questions\n`);
}

// Function to list all flagged questions for review
async function listIncompleteQuestions() {
    console.log('📝 Questions needing context:\n');

    for (let i = 0; i < flaggedQuestions.length; i++) {
        const q = flaggedQuestions[i];
        console.log(`${i + 1}. [${q.module}]`);
        console.log(`   ID: ${q.id}`);
        console.log(`   Question: ${q.text}`);
        console.log(`   Reason: ${q.reason}\n`);
    }
}

// Run based on command line argument
const command = process.argv[2];

if (command === 'list') {
    listIncompleteQuestions().finally(() => prisma.$disconnect());
} else if (command === 'add') {
    addContextToQuestions()
        .catch(console.error)
        .finally(() => prisma.$disconnect());
} else {
    console.log('Usage:');
    console.log('  npx tsx scripts/add-question-context.ts list   # List incomplete questions');
    console.log('  npx tsx scripts/add-question-context.ts add    # Add context to questions');
    process.exit(0);
}
