import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DUMPS_FOLDER = path.join(process.cwd(), 'ceh exam dumps');
const PDF_FILE = path.join(DUMPS_FOLDER, 'CEH EXAM DUMS.pdf');
const TEST_MODE = process.argv.includes('--test-mode');
const MAX_QUESTIONS_TEST = 15;

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

// Detect Snort rules and code blocks
function detectContextBlocks(text: string): Array<{ type: string; content: string; language?: string }> {
    const contexts: Array<{ type: string; content: string; language?: string }> = [];

    // Pattern 1: Snort rules - look for "alert tcp", "log udp", etc.
    const snortPattern = /(alert|log|pass)\s+(tcp|udp|icmp|ip)\s+[^\n]+(?:\([^)]+\))?/gi;
    let match;
    while ((match = snortPattern.exec(text)) !== null) {
        contexts.push({
            type: 'rule',
            content: match[0].trim(),
            language: 'snort'
        });
    }

    // Pattern 2: Command blocks (lines starting with $ or #)
    const commandLines = text.split('\n').filter(line => /^[$#]\s+/.test(line.trim()));
    if (commandLines.length > 0) {
        const commandBlock = commandLines.join('\n');
        if (commandBlock.length > 10) {
            contexts.push({
                type: 'code_block',
                content: commandBlock,
                language: 'bash'
            });
        }
    }

    return contexts;
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

// Extract questions from PDF
async function extractQuestions() {
    console.log('=== CEH Exam Dumps - Enhanced Extraction with Context ===\n');
    console.log(`Test mode: ${TEST_MODE ? 'ON (max ' + MAX_QUESTIONS_TEST + ' questions)' : 'OFF'}\n`);

    if (!fs.existsSync(PDF_FILE)) {
        console.error('PDF not found:', PDF_FILE);
        process.exit(1);
    }

    const dataBuffer = fs.readFileSync(PDF_FILE);
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

    console.log(`Found ${matches.length} question markers\n`);

    const questionsToAdd = [];

    for (let i = 0; i < matches.length; i++) {
        const current = matches[i];
        const next = matches[i + 1];
        const end = next ? next.index : cleanText.length;
        let rawContent = cleanText.slice(current.index + current.fullMatch.length, end).trim();

        const answerMatch = rawContent.match(/Answer:\s*([A-E]+)/i);
        if (!answerMatch) continue;

        const answerLetters = answerMatch[1].split('');
        const answerStartIndex = answerMatch.index!;
        let paramContent = rawContent.slice(0, answerStartIndex).trim();

        const firstOptionMatch = paramContent.match(/\n[A-E]\./);
        if (!firstOptionMatch) continue;

        let questionText = paramContent.slice(0, firstOptionMatch.index).trim();
        const optionsBlock = paramContent.slice(firstOptionMatch.index).trim();

        // Detect context in question text
        const contextBlocks = detectContextBlocks(questionText);

        // Clean question text
        questionText = questionText.replace(WATERMARK_REGEX, '').trim();
        questionText = questionText.replace(/^\s*\d{1,3}\s*$/gm, '').trim();
        questionText = questionText.replace(/\n\s*\n/g, '\n').trim();

        // Remove detected context from question text
        contextBlocks.forEach(ctx => {
            questionText = questionText.replace(ctx.content, '').trim();
        });

        // Parse options
        const optionsList: string[] = [];
        const optionMap: Record<string, string> = {};
        const optMatches = [];
        let optM;
        const safeOptionsBlock = '\n' + optionsBlock.trim();
        const optRegex = new RegExp(optionRegex.source, optionRegex.flags);
        while ((optM = optRegex.exec(safeOptionsBlock)) !== null) {
            optMatches.push({ letter: optM[1], index: optM.index, matchLen: optM[0].length });
        }

        for (let j = 0; j < optMatches.length; j++) {
            const o = optMatches[j];
            const nextO = optMatches[j + 1];
            const contentEnd = nextO ? nextO.index : safeOptionsBlock.length;
            let optText = safeOptionsBlock.slice(o.index + o.matchLen, contentEnd).trim();
            optText = optText.replace(WATERMARK_REGEX, '').trim();
            optionMap[o.letter] = optText;
            optionsList.push(optText);
        }

        const isMultiSelect = answerLetters.length > 1;
        const correctAnswers = answerLetters.map(letter => optionMap[letter]).filter(Boolean);
        if (correctAnswers.length === 0) continue;

        const moduleName = assignModule(questionText);

        questionsToAdd.push({
            text: questionText,
            options: JSON.stringify(optionsList),
            correct: correctAnswers[0],
            module: moduleName,
            answerCount: answerLetters.length,
            correctAnswers: isMultiSelect ? JSON.stringify(correctAnswers) : null,
            contexts: contextBlocks
        });

        if (TEST_MODE && questionsToAdd.length >= MAX_QUESTIONS_TEST) {
            console.log(`Test mode: Stopping after ${MAX_QUESTIONS_TEST} questions\n`);
            break;
        }
    }

    console.log(`Parsed ${questionsToAdd.length} questions\n`);

    // Statistics
    const questionsWithContext = questionsToAdd.filter(q => q.contexts.length > 0);
    const codeBlocks = questionsToAdd.reduce((sum, q) => sum + q.contexts.filter(c => c.type === 'code_block').length, 0);
    const snortRules = questionsToAdd.reduce((sum, q) => sum + q.contexts.filter(c => c.type === 'rule').length, 0);

    console.log('=== Context Statistics ===');
    console.log(`Questions with context: ${questionsWithContext.length}/${questionsToAdd.length}`);
    console.log(`Code blocks: ${codeBlocks}`);
    console.log(`Snort rules: ${snortRules}\n`);

    if (TEST_MODE) {
        console.log('=== Sample Questions with Context ===\n');
        const samples = questionsWithContext.slice(0, 3);
        if (samples.length > 0) {
            samples.forEach((q, idx) => {
                console.log(`Sample ${idx + 1}:`);
                console.log(`Question: ${q.text.substring(0, 100)}...`);
                console.log(`Module: ${q.module}`);
                console.log(`Contexts (${q.contexts.length}):`);
                q.contexts.forEach((ctx, ctxIdx) => {
                    console.log(`  ${ctxIdx + 1}. [${ctx.type}] ${ctx.content.substring(0, 60)}...`);
                });
                console.log('');
            });
        } else {
            console.log('No questions with context detected in first ' + MAX_QUESTIONS_TEST + ' questions');
        }
        console.log('\nTest mode - database insertion skipped');
        return;
    }

    // Save to database
    console.log('=== Saving to Database ===\n');

    const exam = await prisma.exam.upsert({
        where: { name: 'CEH' },
        update: {},
        create: { name: 'CEH', description: 'Certified Ethical Hacker v13 Exam Dumps (with Context)' }
    });

    await prisma.question.deleteMany({});
    console.log('Cleared existing questions\n');

    const BATCH_SIZE = 50;
    for (let i = 0; i < questionsToAdd.length; i += BATCH_SIZE) {
        const batch = questionsToAdd.slice(i, i + BATCH_SIZE);

        for (const q of batch) {
            const hasContext = q.contexts.length > 0;
            const contextType = hasContext ? q.contexts.map((c: any) => c.type).join(',') : null;

            const question = await prisma.question.create({
                data: {
                    text: q.text,
                    options: q.options,
                    correct: q.correct,
                    module: q.module,
                    answerCount: q.answerCount,
                    correctAnswers: q.correctAnswers,
                    hasContext,
                    contextType,
                    examId: exam.id
                }
            });

            // Create context records
            for (const ctx of q.contexts) {
                await prisma.questionContext.create({
                    data: {
                        questionId: question.id,
                        type: ctx.type,
                        content: ctx.content,
                        position: 0, // Before question
                        metadata: ctx.language ? JSON.stringify({ language: ctx.language }) : null
                    }
                });
            }
        }

        console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(questionsToAdd.length / BATCH_SIZE)}`);
    }

    console.log(`\n✅ Successfully inserted ${questionsToAdd.length} questions (${questionsWithContext.length} with context)`);
}

extractQuestions()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
