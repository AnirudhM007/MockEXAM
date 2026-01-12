import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

const PDF_FILE = path.join(process.cwd(), 'CEH EXAM DUMS.pdf');

async function main() {
    console.log("Dumping PDF Text...");
    const dataBuffer = fs.readFileSync(PDF_FILE);
    const data = await pdf(dataBuffer);

    // Log module markers 
    const cleanText = data.text.replace(/\r\n/g, '\n');
    const questionRegex = /(\d+)\s*\.\s*-\s*\(\s*Exam\s*Topic\s*(\d+)\s*\)/gi;

    const modules: Record<string, number> = {};
    let match;
    while ((match = questionRegex.exec(cleanText)) !== null) {
        const modNum = match[2];
        modules[modNum] = (modules[modNum] || 0) + 1;
    }

    console.log("Found Markers per Module (Raw Text):");
    console.log(modules);

    // Also look for other patterns if Exam Topic is sparse
    // maybe "Domain X"? "Module X"?
}

main().catch(console.error);
