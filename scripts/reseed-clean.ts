
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PDF_FILE = path.join(process.cwd(), 'CEH EXAM DUMS.pdf');

// Reuse module regex
const questionRegex = /(\d+)\s*\.\s*-\s*\(\s*Exam\s*Topic\s*(\d+)\s*\)/gi;
const optionRegex = /\n([A-E])\.\s*/g;
const WATERMARK_REGEX = /Certify\s*For\s*Sure\s*with\s*IT\s*Exam\s*Dumps\s*The\s*No\.1\s*IT\s*Certification\s*Dumps\s*\d*\s*software/gi;

function render_page(pageData: any) {
    const render_options = { normalizeWhitespace: false, disableCombineTextItems: true };
    return pageData.getTextContent(render_options).then(function (textContent: any) {
        let lastY, lastX, lastWidth, text = '';
        for (let item of textContent.items) {
            const x = item.transform[4];
            const y = item.transform[5];
            const width = item.width;
            if (!lastY) { lastY = y; lastX = x; lastWidth = width; text += item.str; continue; }
            const yDiff = Math.abs(y - lastY);
            if (yDiff > 5) { text += '\n' + item.str; }
            else {
                const gap = x - (lastX + lastWidth);
                if (gap > 2.0) { text += ' ' + item.str; } else { text += item.str; }
            }
            lastY = y; lastX = x; lastWidth = width;
        }
        return text;
    });
}

async function main() {
    console.log("Cleaning Database...");
    await prisma.question.deleteMany({});
    console.log("Database Cleared.");

    console.log("Parsing PDF...");
    const dataBuffer = fs.readFileSync(PDF_FILE);
    // @ts-ignore
    const data = await pdf(dataBuffer, { pagerender: render_page });
    const cleanText = data.text.replace(/\r\n/g, '\n');

    const matches = [];
    let match;
    while ((match = questionRegex.exec(cleanText)) !== null) {
        matches.push({
            index: match.index,
            number: match[1],
            module: `ExamTopic${match[2]}`,
            fullMatch: match[0]
        });
    }
    console.log(`Found ${matches.length} markers.`);

    const questionsToAdd = [];
    for (let i = 0; i < matches.length; i++) {
        const current = matches[i];
        const next = matches[i + 1];
        const end = next ? next.index : cleanText.length;
        const rawContent = cleanText.slice(current.index + current.fullMatch.length, end).trim();

        const answerMatch = rawContent.match(/Answer:\s*([A-E]+)/i);
        if (!answerMatch) continue;

        const answerLetters = answerMatch[1].split('');
        const answerStartIndex = answerMatch.index!;
        const paramContent = rawContent.slice(0, answerStartIndex).trim();
        const firstOptionMatch = paramContent.match(/\n[A-E]\./);

        if (!firstOptionMatch) continue;

        let questionText = paramContent.slice(0, firstOptionMatch.index).trim();
        const optionsBlock = paramContent.slice(firstOptionMatch.index).trim();

        questionText = questionText.replace(WATERMARK_REGEX, "").replace(/as many of the other clients on the network\./gi, "").trim();

        const optionsList: string[] = [];
        const optionMap: Record<string, string> = {};
        const optMatches = [];
        let optM;
        const safeOptionsBlock = "\n" + optionsBlock.trim();
        while ((optM = optionRegex.exec(safeOptionsBlock)) !== null) {
            optMatches.push({ letter: optM[1], index: optM.index, matchLen: optM[0].length });
        }

        for (let j = 0; j < optMatches.length; j++) {
            const o = optMatches[j];
            const nextO = optMatches[j + 1];
            const contentEnd = nextO ? nextO.index : safeOptionsBlock.length;
            const optText = safeOptionsBlock.slice(o.index + o.matchLen, contentEnd).trim();
            optionMap[o.letter] = optText;
            optionsList.push(optText);
        }

        const correctText = optionMap[answerLetters[0]];
        if (!correctText) continue;

        questionsToAdd.push({
            text: questionText,
            options: JSON.stringify(optionsList),
            correct: correctText,
            module: current.module,
            examName: 'CEH'
        });
    }

    // Upsert Exam
    const exam = await prisma.exam.upsert({
        where: { name: 'CEH' },
        update: {},
        create: { name: 'CEH', description: 'Certified Ethical Hacker v12 Exam Dump' }
    });

    const CHUNK_SIZE = 50;
    for (let i = 0; i < questionsToAdd.length; i += CHUNK_SIZE) {
        const chunk = questionsToAdd.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(q =>
            prisma.question.create({
                data: {
                    text: q.text,
                    options: q.options,
                    correct: q.correct,
                    // @ts-ignore
                    module: q.module,
                    examId: exam.id
                }
            })
        ));
        console.log(`Inserted chunk ${i / CHUNK_SIZE + 1}`);
    }
    console.log("Seeding complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
