import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';
import demoEvents from '@/lib/demo-events.json';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (code !== process.env.DEMO_ACCESS_CODE) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB(true);

    // Clear existing demo events (except permanent ones)
    await Event.deleteMany({ isDemo: true, isPermanent: { $ne: true } });

    // Seed new demo events
    // Filter out events that already exist if they are permanent to avoid duplicates
    // Actually, insertMany might fail if slug is unique.
    // Let's use a safer approach for seeding
    for (const eventData of demoEvents) {
      await Event.findOneAndUpdate(
        { slug: eventData.slug },
        { ...eventData },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ message: 'Demo database seeded successfully' }, { status: 200 });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ message: 'Seeding failed', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
