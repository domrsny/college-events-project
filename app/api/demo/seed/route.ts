import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (code !== process.env.DEMO_ACCESS_CODE) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Demo database seeded successfully' }, { status: 200 });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ message: 'Seeding failed', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
