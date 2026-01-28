// CEH Exam Blueprint - Module Distribution
// Based on CEH v13 Exam Blueprint v5.0

export const BLUEPRINT_DISTRIBUTION = {
    // Total questions in full exam: 125
    totalQuestions: 125,

    // Module distribution with question counts
    modules: {
        "Introduction to Ethical Hacking": 7, // 6% of 125 ≈ 7
        "Footprinting and Reconnaissance": 7,  // Part of 17% Reconnaissance (7+7+7)
        "Scanning Networks": 7,
        "Enumeration": 7,
        "Vulnerability Analysis": 6,  // Part of 15% System Hacking
        "System Hacking": 6,
        "Malware Threats": 7,
        "Sniffing": 6,  // Part of 24% Network/Perimeter (6+6+6+6+6)
        "Social Engineering": 6,
        "Denial-of-Service": 6,
        "Session Hijacking": 6,
        "Evading IDS, Firewalls, and Honeypots": 6,
        "Hacking Web Servers": 6,  // Part of 14% Web Application (6+6+6)
        "Hacking Web Applications": 6,
        "SQL Injection": 6,
        "Hacking Wireless Networks": 6,  // 6% Wireless
        "Hacking Mobile Platforms": 6,  // Part of 10% Mobile/IoT/OT (6+6)
        "IoT Hacking": 6,
        "Cloud Computing": 6,  // 8% Cloud (6+6)
        "Cryptography": 6
    }
};

// Quiz mode configurations
export const QUIZ_MODES = {
    short: {
        name: "Quick Scan",
        totalQuestions: 15,
        timeLimit: null, // No time limit
        description: "15 questions - Quick practice"
    },
    quick: {
        name: "Short Test",
        totalQuestions: 50,
        timeLimit: null,
        description: "50 questions - Medium practice"
    },
    full: {
        name: "Full Length",
        totalQuestions: 125,
        timeLimit: 240 * 60, // 4 hours in seconds
        description: "125 questions - Full exam experience"
    }
};

/**
 * Calculate module distribution for a given quiz mode
 * Maintains proportions from the blueprint
 */
export function calculateModuleDistribution(mode: 'short' | 'quick' | 'full') {
    const config = QUIZ_MODES[mode];
    const { totalQuestions } = config;
    const { modules } = BLUEPRINT_DISTRIBUTION;

    // Calculate scaling factor
    const scaleFactor = totalQuestions / BLUEPRINT_DISTRIBUTION.totalQuestions;

    // Scale each module proportionally
    const distribution: Record<string, number> = {};
    let allocated = 0;

    const moduleEntries = Object.entries(modules);

    for (let i = 0; i < moduleEntries.length; i++) {
        const [module, count] = moduleEntries[i];
        const scaled = Math.round(count * scaleFactor);
        const actualCount = scaled >= 1 ? scaled : (i < totalQuestions ? 1 : 0); // Ensure at least 1 if there's room
        distribution[module] = actualCount;
        allocated += actualCount;
    }

    // Adjust if we're over/under
    const diff = totalQuestions - allocated;
    if (diff !== 0) {
        // Add/remove from largest modules
        const sorted = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
        for (let i = 0; i < Math.abs(diff) && i < sorted.length; i++) {
            distribution[sorted[i][0]] += diff > 0 ? 1 : -1;
        }
    }

    return distribution;
}

// Example usage:
if (require.main === module) {
    console.log('\n=== Quick Scan (15 questions) ===');
    console.log(calculateModuleDistribution('short'));

    console.log('\n=== Short Test (50 questions) ===');
    console.log(calculateModuleDistribution('quick'));

    console.log('\n=== Full Length (125 questions) ===');
    console.log(calculateModuleDistribution('full'));
}
