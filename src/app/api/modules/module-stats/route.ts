// @ts-nocheck
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
        // Use loop to avoid type issues
        for (const g of group) {
            // @ts-ignore
            const mod = g.module;
            // @ts-ignore
            const count = g._count.id;

            if (mod) {
                stats[mod] = count;
            }
        }

        return NextResponse.json(stats);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
