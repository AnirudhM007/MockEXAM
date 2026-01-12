
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

const PDF_FILE = path.join(process.cwd(), 'CEH EXAM DUMS.pdf');

async function testThreshold(threshold: number) {
    function render_page(pageData: any) {
        return pageData.getTextContent({
            normalizeWhitespace: false,
            disableCombineTextItems: true
        }).then(function (textContent: any) {
            let lastY, lastX, lastWidth, text = '';
            for (let item of textContent.items) {
                const x = item.transform[4];
                const y = item.transform[5];
                const width = item.width;
                if (!lastY) {
                    lastY = y; lastX = x; lastWidth = width; text += item.str; continue;
                }
                const yDiff = Math.abs(y - lastY);
                if (yDiff > 5) {
                    text += '\n' + item.str;
                } else {
                    const gap = x - (lastX + lastWidth);
                    if (gap > threshold) {
                        text += ' ' + item.str;
                    } else {
                        text += item.str;
                    }
                }
                lastY = y; lastX = x; lastWidth = width;
            }
            return text;
        });
    }

    const dataBuffer = fs.readFileSync(PDF_FILE);
    // @ts-ignore
    const data = await pdf(dataBuffer, { pagerender: render_page });
    const text = data.text.substring(0, 2000);
    console.log(`\n--- THRESHOLD ${threshold} ---`);
    // Print snippet around "Topic"
    const idx = text.indexOf("Topic");
    if (idx !== -1) {
        console.log(text.substring(idx - 50, idx + 50));
    } else {
        console.log(" 'Topic' not found (likely split)");
        console.log("Snippet: ", text.substring(0, 100));
    }
}

async function main() {
    await testThreshold(0.5);
    await testThreshold(1.0);
    await testThreshold(2.0);
    await testThreshold(3.0);
    await testThreshold(4.0);
}

main();
