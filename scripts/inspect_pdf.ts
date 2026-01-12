
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

const file1 = path.join(process.cwd(), 'CEH EXAM DUMS.pdf');
const file2 = path.join(process.cwd(), 'ceh question dump.pdf');

async function inspect(filePath: string, outPath: string) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return;
        }
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        fs.writeFileSync(outPath, data.text.substring(0, 5000));
        console.log(`Wrote first 5000 chars of ${path.basename(filePath)} to ${outPath}`);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
    }
}

async function run() {
    await inspect(file1, 'debug_pdf_1.txt');
    await inspect(file2, 'debug_pdf_2.txt');
}

run();
