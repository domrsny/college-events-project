import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`demo-seed:${getClientIp(req)}`, 5, 60_000)) {
      return NextResponse.json(
        { message: 'Too many requests, please try again later' },
        { status: 429 }
      );
    }

    const { code } = await req.json();

    if (code !== process.env.DEMO_ACCESS_CODE) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB(true);

    // Clear existing demo events (except permanent seed data)
    await Event.deleteMany({ isDemo: true, isPermanent: { $ne: true } });

    return NextResponse.json({ message: 'Demo database cleared successfully' }, { status: 200 });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      {
        message: 'Seeding failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
