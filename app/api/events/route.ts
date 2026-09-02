import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

import DBconnect from '@/lib/mongodb';
import Event from '@/database/event.model';
import { isDemoMode } from '@/lib/demo-utils';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { serializeEvent, type EventLean } from '@/lib/serialize';
import { getPostHogClient } from '@/lib/posthog-server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`create-event:${getClientIp(req)}`, 5, 60_000)) {
      return NextResponse.json(
        { message: 'Too many requests, please try again later' },
        { status: 429 }
      );
    }

    const sessionId = req.cookies.get('demo-session-id')?.value;
    const isDemo = isDemoMode(req.cookies);

    await DBconnect(isDemo);

    const formData = await req.formData();

    let event;

    try {
      event = Object.fromEntries(formData.entries());
    } catch {
      return NextResponse.json({ message: 'Invalid JSON data format' }, { status: 400 });
    }

    const file = formData.get('image') as File;

    if (!file) return NextResponse.json({ message: 'Image file is required' }, { status: 400 });

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: 'Image must be a JPEG, PNG, WebP, or GIF file' },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json({ message: 'Image must be smaller than 5MB' }, { status: 400 });
    }

    let tags;
    let agenda;

    try {
      const tagsData = formData.get('tags');
      if (!tagsData) {
        return NextResponse.json({ message: 'Tags are required' }, { status: 400 });
      }
      tags = JSON.parse(tagsData as string);
    } catch {
      return NextResponse.json({ message: 'Invalid JSON for tags' }, { status: 400 });
    }

    try {
      const agendaData = formData.get('agenda');
      if (!agendaData) {
        return NextResponse.json({ message: 'Agenda is required' }, { status: 400 });
      }
      agenda = JSON.parse(agendaData as string);
    } catch {
      return NextResponse.json({ message: 'Invalid JSON for agenda' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: 'image', folder: 'CollegeEvent' }, (error, result) => {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        })
        .end(buffer);
    });

    event.image = (uploadResult as { secure_url: string }).secure_url;

    const createdEvent = await Event.create({
      ...event,
      tags: tags,
      agenda: agenda,
      isDemo: isDemo,
      isPermanent: false,
      sessionId: isDemo ? sessionId : undefined,
    });

    return NextResponse.json(
      { message: 'Event created successfully', event: createdEvent },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);

    if (e instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { message: 'Invalid event data', error: e.message },
        { status: 400 }
      );
    }

    getPostHogClient().captureException(e);
    return NextResponse.json(
      { message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get('demo-session-id')?.value;
    const isDemoActive = isDemoMode(req.cookies);

    await DBconnect(isDemoActive);

    // Filter: Global events (isDemo: false) OR permanent demo events OR current user's demo events
    const query = isDemoActive
      ? { $or: [{ isDemo: false }, { isPermanent: true }, { sessionId: sessionId }] }
      : { isDemo: false };

    const events = await Event.find(query).sort({ createdAt: -1 }).lean<EventLean[]>();

    const serializedEvents = events.map(serializeEvent);

    return NextResponse.json(
      { message: 'Events fetched successfully', events: serializedEvents },
      { status: 200 }
    );
  } catch (e) {
    console.error('Error fetching events:', e);
    getPostHogClient().captureException(e);
    return NextResponse.json(
      { message: 'Event fetching failed', error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
