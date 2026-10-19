'use server';

import Booking from '@/database/booking.model';
import connectDB from "@/lib/mongodb";
import { cookies } from "next/headers";
import { isDemoMode } from "@/lib/demo-utils";

export const createBooking = async ({ eventId, email }: { eventId: string; email: string; }) => {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('demo-session-id')?.value;
        const isDemo = isDemoMode(cookieStore);

        await connectDB(isDemo);

        await Booking.create({ 
            eventId, 
            email,
            isDemo,
            sessionId: isDemo ? sessionId : undefined
        });

        return { success: true };
    } catch (e) {
        console.error('create booking failed', e);
        return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
}