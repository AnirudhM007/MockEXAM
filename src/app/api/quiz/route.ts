import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const examName = searchParams.get('exam'); // "CEH" or "ISC2_CC"
    const mode = searchParams.get('mode'); // "short", "medium", "grind", "full"
    const modules = searchParams.get('modules'); // comma separated string

    if (!examName) {
        return NextResponse.json({ error: 'Exam Name is required' }, { status: 400 });
    }

    try {
        // Debug logging
        console.log('=== QUIZ API DEBUG ===');
        console.log('examName:', examName);
        console.log('mode:', mode);
        console.log('modules (raw):', modules);

        const whereClause: any = { name: examName };

        const exam = await prisma.exam.findUnique({
            where: whereClause,
            include: {
                questions: {
                    where: modules ? {
                        module: { in: modules.split(',').map(m => m.trim()) }
                    } : undefined,
                    select: {
                        id: true,
                        text: true,
                        options: true,
                        correct: true,
                        module: true,
                        answerCount: true,
                        correctAnswers: true,
                        hasContext: true,
                        contextType: true,
                        contexts: {
                            select: {
                                id: true,
                                type: true,
                                content: true,
                                position: true,
                                metadata: true
                            },
                            orderBy: {
                                position: 'asc'
                            }
                        }
                    }
                }
            },
        });

        console.log('modules array after split:', modules ? modules.split(',').map(m => m.trim()) : 'undefined');
        console.log('Found exam:', exam ? 'YES' : 'NO');
        console.log('Questions found:', exam?.questions.length || 0);
        if (exam?.questions && exam.questions.length > 0) {
            console.log('Sample question modules:', exam.questions.slice(0, 3).map(q => q.module));
        }
        console.log('======================\n');

        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        let questions = exam.questions;

        // Blueprint-based distribution (only for mode-based quizzes, not module selection)
        if (!modules && mode && ['short', 'grind', 'full'].includes(mode)) {
            // Import distribution logic
            const { calculateModuleDistribution } = await import('@/lib/blueprint');

            // Map mode names
            const modeMapping: Record<string, 'short' | 'quick' | 'full'> = {
                'short': 'short',    // Quick Scan: 15 questions
                'grind': 'quick',    // Short Test: 50 questions
                'full': 'full'       // Full Length: 125 questions
            };

            const blueprintMode = modeMapping[mode];
            if (blueprintMode) {
                const distribution = calculateModuleDistribution(blueprintMode);
                console.log('Using blueprint distribution:', distribution);

                // Select questions based on distribution
                const selectedQuestions: typeof questions = [];

                for (const [moduleName, count] of Object.entries(distribution)) {
                    if (count === 0) continue;

                    // Filter questions for this module
                    const moduleQuestions = questions.filter(q => q.module === moduleName);

                    // Shuffle and pick the required count
                    const shuffled = moduleQuestions.sort(() => Math.random() - 0.5);
                    const picked = shuffled.slice(0, Math.min(count, shuffled.length));

                    selectedQuestions.push(...picked);

                    console.log(`${moduleName}: picked ${picked.length}/${count} (available: ${moduleQuestions.length})`);
                }

                // Shuffle final selection
                questions = selectedQuestions.sort(() => Math.random() - 0.5);
            } else {
                // Fallback to simple shuffle and limit
                questions = questions.sort(() => Math.random() - 0.5);
                const limit = mode === 'medium' ? 25 : questions.length;
                questions = questions.slice(0, limit);
            }
        } else {
            // Module-specific quiz or no mode: just shuffle
            questions = questions.sort(() => Math.random() - 0.5);

            // Apply limits for other modes
            if (mode === 'medium') {
                questions = questions.slice(0, 25);
            }
        }

        const formattedQuestions = questions.map(q => ({
            ...q,
            options: JSON.parse(q.options) // Parse the stored JSON string back to array
        }));

        return NextResponse.json({
            exam: exam.name,
            mode,
            questions: formattedQuestions
        });

    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
