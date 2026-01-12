// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const count = await prisma.question.count();
        const modules = await prisma.question.findMany({
            select: { module: true },
            distinct: ['module']
        });

        return NextResponse.json({
            questionCount: count,
            modules: modules.map(m => m.module),
            status: 'Database connected successfully'
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            status: 'Database connection failed'
        }, { status: 500 });
    }
}
