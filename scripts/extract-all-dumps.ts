
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DUMPS_FOLDER = path.join(process.cwd(), 'ceh exam dumps');

// Define Module List and Keywords (from reseed-smart.ts)
const KEYWORD_MAP: Record<string, string[]> = {
    "Scanning Networks": [
        "nmap", "hping", "port scan", "three-way handshake", "syn scan", "ack scan", "xmas scan", "idle scan", "scanning",
        "null scan", "fin scan", "window size", "ttl", "rst flag", "urg flag", "tcp flag", "udp scan", "colasoft",
        "packet builder", "fragmentation"
    ],
    "SQL Injection": [
        "sql", "injection", "query", "database", "arithmetic", "union select", "1=1", "drop table", "select *",
        "insert into", "update table", "--", "comment", "tautology", "blind sql", "waitfor delay"
    ],
    "Sniffing": [
        "wireshark", "sniff", "packet", "promiscuous", "arp spoofing", "macof", "dhcp starvation", "tcpdump",
        "span port", "mirror port", "mac flooding", "cam table", "lawless", "dsniff", "arp poisoning"
    ],
    "Social Engineering": [
        "phishing", "tailgating", "pretexting", "social engineering", "ident theft", "dumpster diving",
        "shoulder surfing", "piggybacking", "vishing", "smishing", "impersonation", "human based", "quid pro quo"
    ],
    "Denial-of-Service": [
        "dos", "ddos", "flood", "botnet", "syn flood", "smurf", "ping of death", "teardrop", "amplification",
        "reflection", "loic", "slowloris", "availability", "volumetric", "hping3"
    ],
    "Cloud Computing": [
        "cloud", "saas", "paas", "iaas", "aws", "azure", "docker", "serverless", "container", "kubernetes",
        "virtualization", "hypervisor", "s3", "blob", "shared responsibility", "lambda", "cloud security", "vpc"
    ],
    "Cryptography": [
        "encryption", "rsa", "aes", "sha", "pki", "public key", "private key", "md5", "cryptography",
        "digital signature", "certificate", "ca", "collision", "symmetric", "asymmetric", "des", "3des", "one-time pad",
        "birthday attack", "ecc", "elliptical curve", "ipsec", "ike", "diffie-hellman", "pgp", "gpg"
    ],
    "IoT Hacking": [
        "iot", "embedded", "firmware", "thermostat", "camera", "smart", "device", "shodan", "mqtt", "zigbee",
        "scada", "ics", "modbus", "dnp3", "plc", "hmi", "iiot", "owasp iot"
    ],
    "Hacking Wireless Networks": [
        "wpa", "wep", "ssid", "wireless", "wifi", "aircrack", "bluesnarfing", "bluejacking", "rogue access point",
        "evil twin", "wps", "radius", "802.11", "iv", "jamming", "bluetooth", "warchalking", "krack", "dragonblood"
    ],
    "Malware Threats": [
        "virus", "worm", "trojan", "ransomware", "malware", "rootkit", "keylogger", "spyware", "wrapper",
        "crypter", "bot", "c2", "command and control", "logic bomb", "backdoor", "apt", "downloader", "dropper"
    ],
    "Footprinting and Reconnaissance": [
        "whois", "nslookup", "reconnaissance", "footprinting", "google hacking", "shodan", "theharvester", "maltego",
        "soa record", "mx record", "dns", "zone transfer", "axfr", "job posting", "archive.org", "traceroute", "ghdb",
        "censys", "netcraft", "recon-ng", "osint"
    ],
    "System Hacking": [
        "crack", "password", "privilege escalation", "cover tracks", "steganography", "ntlm", "rainbow table",
        "sam file", "dll injection", "ads", "alternate data stream", "audit policy", "kerberos", "golden ticket",
        "mimikatz", "hash", "salt", "brute force", "dictionary attack", "keylogger", "spyware"
    ],
    "Hacking Web Applications": [
        "xss", "cross-site", "csrf", "owasp", "web app", "burp suite", "cookie poisoning", "parameter tampering",
        "directory traversal", "hidden field", "soap", "rest", "api", "lfi", "rfi", "shellshock", "web shell"
    ],
    "Session Hijacking": [
        "session", "cookie", "hijack", "token", "fixation", "sidejacking", "cross-site script", "predictable",
        "man-in-the-browser", "mitb", "session sniffing"
    ],
    "Evading IDS, Firewalls, and Honeypots": [
        "firewall", "ids", "ips", "honeypot", "evasion", "fragmentation", "bastion host", "dmz", "stateful",
        "packet filter", "proxy", "decoy", "obfuscation", "tunneling", "source routing"
    ],
    "Hacking Web Servers": [
        "web server", "apache", "iis", "banner grabbing", "port 80", "port 443", "http", "https", "patch management",
        "webdav", "http methods", "put", "delete", "trace"
    ],
    "Hacking Mobile Platforms": [
        "android", "ios", "jailbreak", "rooting", "mobile", "apk", "sandbox", "mdm", "byod", "sideloading",
        "google play", "app store", "webview", "sms", "smishing", "bluebugging", "agent"
    ],
    "Enumeration": [
        "enumeration", "snmp", "ldap", "netbios", "smtp", "zone transfer", "finger", "rpc", "smb", "null session",
        "global catalog", "port 139", "port 445", "port 161", "port 389"
    ],
    "Vulnerability Analysis": [
        "vulnerability", "scanner", "nessus", "openvas", "cve", "cvss", "false positive", "assessment", "qualys",
        "severity", "remediation", "management"
    ],
    "Introduction to Ethical Hacking": [
        "cia triad", "ethical hacker", "black hat", "white hat", "penetration testing", "laws", "regulations",
        "osstmm", "risk management", "security policy", "grey hat", "suicide hacker", "script kiddie", "apt"
    ]
};

// Cleaning regex
const WATERMARK_REGEX = /Certify\s*For\s*Sure\s*with\s*IT\s*Exam\s*Dumps\s*The\s*No\.1\s*IT\s*Certification\s*Dumps\s*\d*\s*software/gi;
const questionRegex = /(\d+)\s*\.\s*-\s*\(\s*Exam\s*Topic\s*(\d+)\s*\)/gi;
const optionRegex = /\n([A-E])\.\s*/g;

// Custom PDF renderer
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

// Assign module based on keywords
function assignModule(text: string): string {
    const lower = text.toLowerCase();
    let bestMatch = "Introduction to Ethical Hacking";
    let maxHits = 0;

    for (const [module, keywords] of Object.entries(KEYWORD_MAP)) {
        let hits = 0;
        for (const k of keywords) {
            if (lower.includes(k)) hits++;
        }
        if (hits > maxHits) {
            maxHits = hits;
            bestMatch = module;
        }
    }

    return bestMatch;
}

// Extract questions from a PDF
async function extractQuestionsFromPDF(pdfPath: string) {
    console.log(`\nProcessing: ${path.basename(pdfPath)}`);
    const dataBuffer = fs.readFileSync(pdfPath);
    // @ts-ignore
    const data = await pdf(dataBuffer, { pagerender: render_page });
    const cleanText = data.text.replace(/\r\n/g, '\n');

    const matches = [];
    let match;
    const regex = new RegExp(questionRegex.source, questionRegex.flags);
    while ((match = regex.exec(cleanText)) !== null) {
        matches.push({
            index: match.index,
            number: match[1],
            fullMatch: match[0]
        });
    }

    const questionsFromThisPDF = [];
    console.log(`  Found ${matches.length} potential questions`);

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

        // Enhanced watermark removal - multiple patterns
        // Pattern 1: Full watermark with or without "software"
        questionText = questionText.replace(/Certify\s*For\s*Sure\s*with\s*IT\s*Exam\s*Dumps\s*The\s*No\.?\s*1\s*IT\s*Certification\s*Dumps(\s*\d+)?(\s*software)?/gi, "").trim();

        // Pattern 2: Standalone page numbers that appear after watermark removal
        questionText = questionText.replace(/^\s*\d{1,3}\s*$/gm, "").trim();

        // Pattern 3: Clean up multiple newlines and extra spaces
        questionText = questionText.replace(/\n\s*\n/g, '\n').trim();

        const moduleName = assignModule(questionText);

        const optionsList: string[] = [];
        const optionMap: Record<string, string> = {};
        const optMatches = [];
        let optM;
        const safeOptionsBlock = "\n" + optionsBlock.trim();
        const optRegex = new RegExp(optionRegex.source, optionRegex.flags);
        while ((optM = optRegex.exec(safeOptionsBlock)) !== null) {
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

        questionsFromThisPDF.push({
            text: questionText,
            options: JSON.stringify(optionsList),
            correct: correctText,
            module: moduleName,
            examName: 'CEH'
        });
    }

    console.log(`  Extracted ${questionsFromThisPDF.length} valid questions`);
    return questionsFromThisPDF;
}

// Normalize question text for comparison (remove extra spaces, case insensitive)
function normalizeText(text: string): string {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

async function main() {
    console.log("=== CEH Exam Dumps - Multi-PDF Extraction ===\n");

    // Get all PDF files
    const pdfFiles = fs.readdirSync(DUMPS_FOLDER)
        .filter(file => file.toLowerCase().endsWith('.pdf'))
        .map(file => path.join(DUMPS_FOLDER, file));

    console.log(`Found ${pdfFiles.length} PDF files:`);
    pdfFiles.forEach(file => console.log(`  - ${path.basename(file)}`));

    // Extract questions from all PDFs
    const allQuestions = [];
    for (const pdfPath of pdfFiles) {
        const questions = await extractQuestionsFromPDF(pdfPath);
        allQuestions.push(...questions);
    }

    console.log(`\n=== Deduplication ===`);
    console.log(`Total questions before deduplication: ${allQuestions.length}`);

    // Deduplicate based on normalized question text
    const uniqueQuestions = [];
    const seenTexts = new Set<string>();
    let duplicateCount = 0;

    for (const q of allQuestions) {
        const normalized = normalizeText(q.text);
        if (!seenTexts.has(normalized)) {
            seenTexts.add(normalized);
            uniqueQuestions.push(q);
        } else {
            duplicateCount++;
        }
    }

    console.log(`Duplicate questions filtered: ${duplicateCount}`);
    console.log(`Unique questions to add: ${uniqueQuestions.length}`);

    // Module breakdown
    const moduleBreakdown: Record<string, number> = {};
    for (const q of uniqueQuestions) {
        moduleBreakdown[q.module] = (moduleBreakdown[q.module] || 0) + 1;
    }

    console.log(`\n=== Module Breakdown ===`);
    const sortedModules = Object.entries(moduleBreakdown).sort((a, b) => b[1] - a[1]);
    for (const [module, count] of sortedModules) {
        console.log(`  ${module}: ${count} questions`);
    }

    // Clear existing questions and add new ones
    console.log(`\n=== Database Operations ===`);
    console.log("Clearing existing questions...");
    await prisma.question.deleteMany({});

    // Upsert Exam
    const exam = await prisma.exam.upsert({
        where: { name: 'CEH' },
        update: {},
        create: { name: 'CEH', description: 'Certified Ethical Hacker v13 Exam Dumps' }
    });

    console.log("Adding unique questions to database...");
    const CHUNK_SIZE = 50;
    for (let i = 0; i < uniqueQuestions.length; i += CHUNK_SIZE) {
        const chunk = uniqueQuestions.slice(i, i + CHUNK_SIZE);
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
        console.log(`  Progress: ${Math.min(i + CHUNK_SIZE, uniqueQuestions.length)}/${uniqueQuestions.length}`);
    }

    console.log(`\n=== Complete ===`);
    console.log(`✓ Successfully added ${uniqueQuestions.length} unique questions to the database`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
