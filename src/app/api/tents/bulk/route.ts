import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'EVENT_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { namePrefix, quantity, capacity, sectorId, patternType = 'DASH_NUMBER', startFrom = 1 } = await req.json();

        // Validate Sector existence
        const sector = await prisma.sector.findUnique({ where: { id: sectorId } });
        if (!sector) {
            return NextResponse.json({ error: 'Target sector not found in registry' }, { status: 400 });
        }

        const tentsData: { name: string; capacity: number; sectorId: string }[] = [];
        for (let i = 0; i < quantity; i++) {
            const index = startFrom + i;
            let name = "";

            switch (patternType) {
                case 'SPACE_NUMBER':
                    name = namePrefix ? `${namePrefix} ${index}` : `${index}`;
                    break;
                case 'UNDERSCORE_NUMBER':
                    name = namePrefix ? `${namePrefix}_${index}` : `${index}`;
                    break;
                case 'JUST_NUMBER':
                    name = `${index}`;
                    break;
                case 'DASH_NUMBER':
                default:
                    name = namePrefix ? `${namePrefix}-${index}` : `${index}`;
                    break;
            }

            tentsData.push({
                name: name.trim(),
                capacity: Number(capacity) || 4,
                sectorId
            });
        }

        // Use a standard transaction loop for maximum compatibility across Prisma providers
        await prisma.$transaction(
            tentsData.map(data => prisma.tent.create({ data }))
        );

        return NextResponse.json({ success: true, count: quantity });
    } catch (error: any) {
        console.error('Bulk Create Tents Error:', error);

        let errorMessage = 'System failure during bulk deployment';

        // Handle Prism-specific errors (Unique constraint is P2002)
        if (error?.code === 'P2002') {
            errorMessage = 'Duplicate tent names detected. Please check your start index or prefix.';
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'EVENT_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const sectorId = searchParams.get('sectorId');

        if (!sectorId) {
            return NextResponse.json({ error: 'Sector ID required' }, { status: 400 });
        }

        // Delete all tents in sector that have no confirmed bookings
        // Note: For safety, we only delete if no bookings exist OR we can extend this logic.
        // For simple "Clear", we delete all. Prisma will throw error if foreign key constraints fail.
        await prisma.tent.deleteMany({
            where: { sectorId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Bulk Delete Tents Error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error during bulk deletion'
        }, { status: 500 });
    }
}
