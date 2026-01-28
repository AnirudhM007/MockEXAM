import pdf from 'pdf-parse';
import fs from 'fs';
import path from 'path';

async function extractBlueprint() {
    const blueprintPath = path.join(process.cwd(), 'Blueprint', 'CEH-Exam-Blueprint-v5.pdf');
    const dataBuffer = fs.readFileSync(blueprintPath);
    const data = await pdf(dataBuffer);

    console.log('=== CEH Exam Blueprint Analysis ===\n');
    console.log('First 5000 characters of blueprint:\n');
    console.log(data.text.substring(0, 5000));
    console.log('\n\n=== End of Preview ===');
}

extractBlueprint().catch(console.error);
