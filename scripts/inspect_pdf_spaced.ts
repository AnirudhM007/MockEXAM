
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

const file1 = path.join(process.cwd(), 'CEH EXAM DUMS.pdf');

function render_page(pageData: any) {
    // Custom render to add spaces between text items
    const render_options = {
        normalizeWhitespace: false,
        disableCombineTextItems: false
    };

    return pageData.getTextContent(render_options)
        .then(function (textContent: any) {
            let lastY, text = '';
            for (let item of textContent.items) {
                // If on the same line (approx), add space
                // Actually, just always add a space between items to be safe, or check distance?
                // For now, let's just join everything with a space and see.
                // But we want to preserve newlines for structure.

                if (lastY == item.transform[5] || !lastY) {
                    text += item.str + " "; // space between items on same line
                } else {
                    text += '\n' + item.str + " "; // new line
                }
                lastY = item.transform[5];
            }
            return text;
        });
}

async function inspect(filePath: string, outPath: string) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return;
        }
        const dataBuffer = fs.readFileSync(filePath);
        // @ts-ignore
        const data = await pdf(dataBuffer, { pagerender: render_page });
        fs.writeFileSync(outPath, data.text.substring(0, 5000));
        console.log(`Wrote first 5000 chars (with custom render) of ${path.basename(filePath)} to ${outPath}`);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
    }
}

async function run() {
    await inspect(file1, 'debug_pdf_spaced.txt');
}

run();
