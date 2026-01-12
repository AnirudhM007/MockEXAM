
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PDF_FILE = path.join(process.cwd(), 'CEH EXAM DUMS.pdf');

// 1. Define Module List and Keywords
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

// Reuse previous cleaning regex
const WATERMARK_REGEX = /Certify\s*For\s*Sure\s*with\s*IT\s*Exam\s*Dumps\s*The\s*No\.1\s*IT\s*Certification\s*Dumps\s*\d*\s*software/gi;
const questionRegex = /(\d+)\s*\.\s*-\s*\(\s*Exam\s*Topic\s*(\d+)\s*\)/gi;
const optionRegex = /\n([A-E])\.\s*/g;

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

    // If absolutely no hits, fallback to rotating assignment or keep simple default
    return bestMatch;
}


async function main() {
    console.log("Starting Smart Reseed...");
    await prisma.question.deleteMany({});

    const dataBuffer = fs.readFileSync(PDF_FILE);
    // @ts-ignore
    const data = await pdf(dataBuffer, { pagerender: render_page });
    const cleanText = data.text.replace(/\r\n/g, '\n');

    const matches = [];
    let match;
    while ((match = questionRegex.exec(cleanText)) !== null) {
        matches.push({
            index: match.index,
            number: match[1],
            fullMatch: match[0]
        });
    }

    const questionsToAdd = [];
    console.log(`Analyzing ${matches.length} questions...`);

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

        questionText = questionText.replace(WATERMARK_REGEX, "").trim();

        // --- SMART TAGGING ---
        const moduleName = assignModule(questionText);
        // ---------------------

        const optionsList: string[] = [];
        const optionMap: Record<string, string> = {};
        const optMatches = [];
        let optM;
        const safeOptionsBlock = "\n" + optionsBlock.trim();
        while ((optM = optionRegex.exec(safeOptionsBlock)) !== null) {
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

        questionsToAdd.push({
            text: questionText,
            options: JSON.stringify(optionsList),
            correct: correctText,
            module: moduleName,
            examName: 'CEH'
        });
    }

    // Upsert Exam
    const exam = await prisma.exam.upsert({
        where: { name: 'CEH' },
        update: {},
        create: { name: 'CEH', description: 'Certified Ethical Hacker v12 Exam Dump' }
    });

    const CHUNK_SIZE = 50;
    for (let i = 0; i < questionsToAdd.length; i += CHUNK_SIZE) {
        const chunk = questionsToAdd.slice(i, i + CHUNK_SIZE);
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
    }
    console.log(`Seeding complete. Processed ${questionsToAdd.length} questions.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
