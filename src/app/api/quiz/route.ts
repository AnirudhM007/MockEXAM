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
                        module: true
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

        // Shuffle questions
        questions = questions.sort(() => Math.random() - 0.5);

        // Limit based on mode
        let limit = questions.length;
        if (mode === 'short') limit = 15;
        else if (mode === 'medium') limit = 25;
        else if (mode === 'grind') limit = 50;
        else if (mode === 'full') limit = 125;
        // No mode specified = all questions

        const selectedQuestions = questions.slice(0, limit).map(q => ({
            ...q,
            options: JSON.parse(q.options) // Parse the stored JSON string back to array
        }));

        return NextResponse.json({
            exam: exam.name,
            mode,
            questions: selectedQuestions
        });

    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
