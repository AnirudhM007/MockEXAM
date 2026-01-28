
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PDF_FILE = path.join(process.cwd(), 'CEH EXAM DUMS.pdf');

// Custom render to fix spacing issues in the PDF
function render_page(pageData: any) {
    const render_options = {
        normalizeWhitespace: false,
        disableCombineTextItems: true
    };

    return pageData.getTextContent(render_options)
        .then(function (textContent: any) {
            let lastY, lastX, lastWidth, text = '';
            for (let item of textContent.items) {
                const x = item.transform[4];
                const y = item.transform[5];
                const width = item.width;

                if (!lastY) {
                    lastY = y;
                    lastX = x;
                    lastWidth = width;
                    text += item.str;
                    continue;
                }

                const yDiff = Math.abs(y - lastY);
                if (yDiff > 5) {
                    text += '\n' + item.str;
                } else {
                    const gap = x - (lastX + lastWidth);
                    // Calibrated threshold: 2.0 works best
                    if (gap > 2.0) {
                        text += ' ' + item.str;
                    } else {
                        text += item.str;
                    }
                }

                lastY = y;
                lastX = x;
                lastWidth = width;
            }
            return text;
        });
}

async function main() {
    console.log("Starting PDF Layout Analysis...");
    if (!fs.existsSync(PDF_FILE)) {
        console.error("PDF not found:", PDF_FILE);
        return;
    }

    const dataBuffer = fs.readFileSync(PDF_FILE);
    // @ts-ignore
    const data = await pdf(dataBuffer, { pagerender: render_page });
    const fullText = data.text;

    console.log(`Extracted ${fullText.length} characters.`);

    // Normalize newlines
    const cleanText = fullText.replace(/\r\n/g, '\n');

    // Regex to match "1. - (Exam Topic 1)" with flexible spacing
    const questionRegex = /(\d+)\s*\.\s*-\s*\(\s*Exam\s*Topic\s*(\d+)\s*\)/gi;

    // We need to split the text but keep the delimiters to know the module/number
    const matches = [];
    let match;
    while ((match = questionRegex.exec(cleanText)) !== null) {
        matches.push({
            index: match.index,
            number: match[1],
            module: `ExamTopic${match[2]}`, // Standardize naming back to ExamTopicX
            moduleNum: parseInt(match[2]),
            fullMatch: match[0]
        });
    }

    console.log(`Found ${matches.length} questions markers.`);

    const questionsToAdd = [];

    for (let i = 0; i < matches.length; i++) {
        const current = matches[i];
        const next = matches[i + 1];
        const end = next ? next.index : cleanText.length;

        const rawContent = cleanText.slice(current.index + current.fullMatch.length, end).trim();

        // Parse Question Body, Options, Answer
        // Structure usually:
        // Text text text...
        // A. Option ...
        // B. Option ...
        // Answer: X

        // Find "Answer:"
        const answerMatch = rawContent.match(/Answer:\s*([A-E]+)/i);
        if (!answerMatch) {
            // console.log(`Skipping Q${current.number}: No answer found.`);
            continue;
        }

        const answerLetters = answerMatch[1].split(''); // could be multiple like BCDE
        const answerStartIndex = answerMatch.index!;

        // Content before Answer is Question + Options
        const paramContent = rawContent.slice(0, answerStartIndex).trim();

        // Split options
        // Look for "A.", "B.", "C.", "D." at start of lines or preceded by newline
        // Note: Sometimes options are on same line? The extraction usually puts them on new lines due to Y diff.

        // Regex to split options: Look for \n[A-E]\.
        // But first, separate Question Text from First Option.
        const firstOptionMatch = paramContent.match(/\n[A-E]\./);

        if (!firstOptionMatch) {
            // console.log(`Skipping Q${current.number}: No options found.`);
            continue;
        }

        let questionText = paramContent.slice(0, firstOptionMatch.index).trim();
        const optionsBlock = paramContent.slice(firstOptionMatch.index).trim();

        // WATERMARK CLEANUP
        // Remove the pervasive watermark text found in the extraction
        const WATERMARK_REGEX = /Certify\s*For\s*Sure\s*with\s*IT\s*Exam\s*Dumps\s*The\s*No\.1\s*IT\s*Certification\s*Dumps\s*\d*\s*software/gi;
        questionText = questionText.replace(WATERMARK_REGEX, "").replace(/as many of the other clients on the network\./gi, "").trim();
        // Note: The watermark sometimes splits sentences. "This client uses the same hardware and [Watermark] as many of the other clients..."
        // The regex catches the main block. The "as many..." part might be part of the sentence or specific watermark trash?
        // Actually, looking at the screenshot: "...same hardware and [Watermark] software as many of the other clients..."
        // The watermark is "Certify For Sure ... software".
        // So the sentence becomes "...same hardware and as many of the other clients...".
        // Wait, "same hardware and software as many..." -> "same hardware and [Certify...software] as many..."
        // So removing the watermark *should* leave "same hardware and  as many...".
        // We might want to fix the sentence flow but simple removal is safer than guessing.

        // Split options
        const optionRegex = /\n([A-E])\.\s*/g;

        const optionsList: string[] = [];
        const optionMap: Record<string, string> = {};

        // Let's use split but keep delimiters
        // Actually, simple split might lose the letter.
        // Let's iterate matches of [A-E].

        const optMatches = [];
        let optM;
        // Make sure we match start of string for first option too
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

        // Determine correct answer string
        // If multiple answers, we might need a different schema or just pick one?
        // Schema has `correct String` (singular).
        // If multiple, maybe comma join? Or Pick first?
        // Let's comma join if multiple, but ideally UI handles single choice. 
        // If answer is "BCDE", we can't easily map to ONE option text unless we combine them?
        // For now, let's just take the first correct answer letter.
        const correctLetter = answerLetters[0];
        const correctText = optionMap[correctLetter];

        if (!correctText) {
            // console.log(`Skipping Q${current.number}: Correct option ${correctLetter} text not found.`);
            continue;
        }

        questionsToAdd.push({
            text: questionText,
            options: JSON.stringify(optionsList),
            correct: correctText,
            module: current.module,
            examName: 'CEH'
        });
    }

    console.log(`Successfully parsed ${questionsToAdd.length} questions.`);

    // DB Operations
    // Create Exam if not exists
    const exam = await prisma.exam.upsert({
        where: { name: 'CEH' },
        update: {},
        create: {
            name: 'CEH',
            description: 'Certified Ethical Hacker v12 Exam Dump'
        }
    });

    console.log("Upserted Exam CEH.");

    // Clear existing questions for this exam?
    // User might want to keep mock data? But usually dump replaces.
    // Let's delete old PDF questions? Hard to distinguish.
    // Let's just create new ones.

    // Batch insert
    // SQLite might have limit on bind variables, so chunk it.
    const CHUNK_SIZE = 50;
    for (let i = 0; i < questionsToAdd.length; i += CHUNK_SIZE) {
        const chunk = questionsToAdd.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(q =>
            prisma.question.create({
                data: {
                    text: q.text,
                    options: q.options,
                    correct: q.correct,
                    module: q.module,
                    examId: exam.id
                }
            })
        ));
        console.log(`Inserted chunk ${i / CHUNK_SIZE + 1}`);
    }

    console.log("Seeding complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
