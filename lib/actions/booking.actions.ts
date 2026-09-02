'use server';

import mongoose from 'mongoose';
import Booking from '@/database/booking.model';
import connectDB from '@/lib/mongodb';
import { cookies, headers } from 'next/headers';
import { isDemoMode } from '@/lib/demo-utils';
import { rateLimit } from '@/lib/rate-limit';
import { getPostHogClient } from '@/lib/posthog-server';

export const createBooking = async ({ eventId, email }: { eventId: string; email: string }) => {
  try {
    const headerStore = await headers();
    const ip = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    if (!rateLimit(`create-booking:${ip}`, 10, 60_000)) {
      return { success: false, error: 'Too many requests, please try again later' };
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('demo-session-id')?.value;
    const isDemo = isDemoMode(cookieStore);

    await connectDB(isDemo);

    await Booking.create({
      eventId,
      email,
      isDemo,
      sessionId: isDemo ? sessionId : undefined,
    });

    return { success: true };
  } catch (e) {
    console.error('create booking failed', e);

    if (e instanceof mongoose.Error.ValidationError) {
      return {
        success: false,
        error: Object.values(e.errors)[0]?.message || 'Invalid booking data',
      };
    }

    getPostHogClient().captureException(e);
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
};
