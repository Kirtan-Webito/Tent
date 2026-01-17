'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateMember(memberId: string, data: {
    name: string;
    age: number;
    gender: string;
    mobile?: string;
    notes?: string;
    checkInDate?: string;
    checkOutDate?: string;
}) {
    try {
        // Update Member
        const member = await prisma.member.update({
            where: { id: memberId },
            data: {
                name: data.name,
                age: data.age,
                gender: data.gender
            },
            include: { booking: true }
        });

        // Update Booking fields if provided
        const bookingUpdateData: any = {};
        if (data.mobile) bookingUpdateData.mobile = data.mobile;
        if (data.notes !== undefined) bookingUpdateData.notes = data.notes;
        if (data.checkInDate) bookingUpdateData.checkInDate = new Date(data.checkInDate);
        if (data.checkOutDate) bookingUpdateData.checkOutDate = new Date(data.checkOutDate);

        if (Object.keys(bookingUpdateData).length > 0 && member.bookingId) {
            await prisma.booking.update({
                where: { id: member.bookingId },
                data: bookingUpdateData
            });
        }

        revalidatePath('/desk-admin/guests');
        revalidatePath('/desk-admin/booking');
        return { success: true };
    } catch (error) {
        console.error('Failed to update member:', error);
        return { success: false, error: 'Failed to update member details' };
    }
}
