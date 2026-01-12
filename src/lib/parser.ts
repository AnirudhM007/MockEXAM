import pdf from 'pdf-parse';

export interface ParsedQuestion {
    text: string;
    options: string[]; // ["Option A", "Option B", ...]
    correct: string;   // "A", "B", "C", or "D" (or the full text)
}

export async function parsePdf(buffer: Buffer): Promise<ParsedQuestion[]> {
    const data = await pdf(buffer);
    const text = data.text;

    // This is a heuristic parser. Exam dumps vary wildly.
    // We assume a structure roughly like:
    // "Question 1" or "Q1" or just numbered lines.

    // Strategy:
    // 1. Split text into blocks based on "Question \d+" markers.
    // 2. For each block, find the Options (A., B., C., D.)
    // 3. Find the "Correct Answer:" or "Answer:" section.

    const questions: ParsedQuestion[] = [];

    // Split by Question markers (e.g. "Question 1", "Question 2")
    // Regex looks for "Question" followed by number, but flexible.
    const questionBlocks = text.split(/Question\s+\d+/i).filter(b => b.trim().length > 10);

    for (const block of questionBlocks) {
        const q: ParsedQuestion = {
            text: '',
            options: [],
            correct: '',
        };

        // Extract Answer first to remove it from text
        const answerMatch = block.match(/(?:Correct\s+)?Answer:\s*([A-D])/i) || block.match(/Ans:\s*([A-D])/i);
        let cleanBlock = block;

        if (answerMatch) {
            q.correct = answerMatch[1].toUpperCase();
            // Remove the answer line from the block to avoid confusion
            cleanBlock = block.substring(0, answerMatch.index);
        }

        // Extract Options
        // Build regex for A., B., C., D.
        // We assume they appear in order.

        // Split by A., B., C., D.
        // Note: This is fragile.
        const parts = cleanBlock.split(/(?:^|\n)[A-D]\./);

        if (parts.length >= 5) {
            // parts[0] is question text
            // parts[1] is A, parts[2] is B...
            q.text = parts[0].trim();
            q.options = [
                parts[1].trim(),
                parts[2].trim(),
                parts[3].trim(),
                parts[4].trim(),
            ];
        } else {
            // Fallback: try finding lines starting with A), B) etc.
            q.text = cleanBlock.trim(); // Just dump everything if structure fails
        }

        // Only add if we found options and a question
        if (q.options.length === 4 && q.text) {
            questions.push(q);
        }
    }

    return questions;
}
