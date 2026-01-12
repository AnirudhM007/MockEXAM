
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PDF_FILE = path.join(process.cwd(), 'CEH EXAM DUMS.pdf');

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
                    if (gap > 1.5) {
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

    // Normalize newlines
    const cleanText = fullText.replace(/\r\n/g, '\n');

    // DEBUG: Find "ExamTopic" location
    const snippetIndex = cleanText.indexOf("ExamTopic");
    if (snippetIndex !== -1) {
        console.log("DEBUG: Snippet around 'ExamTopic':");
        console.log(cleanText.substring(snippetIndex - 50, snippetIndex + 50));
        console.log("DEBUG: Hex dump of snippet:");
        const sub = cleanText.substring(snippetIndex - 10, snippetIndex + 20);
        for (let i = 0; i < sub.length; i++) {
            console.log(`${sub[i]} : ${sub.charCodeAt(i)}`);
        }
    } else {
        console.log("DEBUG: 'ExamTopic' not found in text!");
    }

    // Relaxed regex: handle potential spaces
    // The previous regex was: /(\d+)\.-\((ExamTopic\d+)\)/g
    const questionRegex = /(\d+)\s*\.\s*-\s*\((ExamTopic\d+)\)/g;

    const matches = [];
    let match;
    while ((match = questionRegex.exec(cleanText)) !== null) {
        matches.push({
            index: match.index,
            number: match[1],
            module: match[2],
            fullMatch: match[0]
        });
    }

    console.log(`Found ${matches.length} questions markers using relaxed regex.`);

    // ... rest of logic skipped for debug ...
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
