import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        // @ts-ignore
        const group: any = await prisma.question.groupBy({
            by: ['module'],
            _count: { id: true }
        });

        // Convert to easy dictionary: { "IoT Hacking": 3 }
        const stats: Record<string, number> = {};
        // @ts-ignore
        group.forEach((g: any) => {
            if (g.module) {
                stats[g.module] = g._count.id;
            }
        });

        return NextResponse.json(stats);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
