import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parsePdf } from '@/lib/parser';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const examName = formData.get('exam') as string;

        if (!file || !examName) {
            return NextResponse.json({ error: 'File and Exam Name are required' }, { status: 400 });
        }

        // Find the exam
        const exam = await prisma.exam.findUnique({
            where: { name: examName }
        });

        if (!exam) {
            return NextResponse.json({ error: `Exam '${examName}' not found.` }, { status: 404 });
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse PDF
        const parsedQuestions = await parsePdf(buffer);

        if (parsedQuestions.length === 0) {
            return NextResponse.json({ error: 'No questions found in PDF. Check format.' }, { status: 400 });
        }

        // Save to DB
        let addedCount = 0;
        for (const q of parsedQuestions) {
            await prisma.question.create({
                data: {
                    text: q.text,
                    options: JSON.stringify(q.options),
                    correct: q.correct,
                    examId: exam.id
                }
            });
            addedCount++;
        }

        return NextResponse.json({
            success: true,
            count: addedCount,
            message: `Successfully added ${addedCount} questions to ${examName}.`
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error processing file.' }, { status: 500 });
    }
}
