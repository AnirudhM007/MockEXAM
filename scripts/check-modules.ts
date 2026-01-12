
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

const PDF_FILE = path.join(process.cwd(), 'CEH EXAM DUMS.pdf');

const MODULE_NAMES = [
    "Introduction to Ethical Hacking",
    "Footprinting and Reconnaissance",
    "Scanning Networks",
    "Enumeration",
    "Vulnerability Analysis",
    "System Hacking",
    "Malware Threats",
    "Sniffing",
    "Social Engineering",
    "Denial-of-Service",
    "Session Hijacking",
    "Evading IDS, Firewalls, and Honeypots",
    "Hacking Web Servers",
    "Hacking Web Applications",
    "SQL Injection",
    "Hacking Wireless Networks",
    "Hacking Mobile Platforms",
    "IoT Hacking",
    "Cloud Computing",
    "Cryptography"
];

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
    console.log("Searching for Module Names in PDF...");
    const dataBuffer = fs.readFileSync(PDF_FILE);
    // @ts-ignore
    const data = await pdf(dataBuffer, { pagerender: render_page });
    const cleanText = data.text; // Don't normalize newlines heavily yet, just search

    for (const name of MODULE_NAMES) {
        // Regex to search case insensitive and allow whitespace variations
        // e.g. "Scanning  Networks"
        const regexStr = name.replace(/ /g, '\\s+');
        const regex = new RegExp(regexStr, 'i');
        const found = regex.test(cleanText);
        console.log(`[${found ? 'FOUND' : 'MISSING'}] ${name}`);
    }
}

main().catch(console.error);
