
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

const file1 = path.join(process.cwd(), 'CEH EXAM DUMS.pdf');

function render_page(pageData: any) {
    const render_options = {
        normalizeWhitespace: false,
        disableCombineTextItems: true // Ensure we get individual items to calculate gaps
    };

    return pageData.getTextContent(render_options)
        .then(function (textContent: any) {
            let lastY, lastX, lastWidth, text = '';
            for (let item of textContent.items) {
                const x = item.transform[4];
                const y = item.transform[5];
                const width = item.width;

                // Initialize
                if (!lastY) {
                    lastY = y;
                    lastX = x;
                    lastWidth = width;
                    text += item.str;
                    continue;
                }

                // Check for new line (y changed significantly)
                if (Math.abs(y - lastY) > 5) {
                    text += '\n' + item.str;
                } else {
                    // Check for space
                    // Gap between end of last char and start of this char
                    const gap = x - (lastX + lastWidth);
                    // Threshold: if gap is roughly positive (sometimes it's negative for kerning)
                    // If gap is larger than a small fraction (e.g. 2 units), it's likely a space.
                    // Typical font size might be 10-12. A space is maybe 3-4?
                    if (gap > 4) {
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
        console.log(`Wrote first 5000 chars (smart render) of ${path.basename(filePath)} to ${outPath}`);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
    }
}

async function run() {
    await inspect(file1, 'debug_pdf_smart.txt');
}

run();
