'use server';

import Event from '@/database/event.model';
import DBconnect from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { isDemoMode } from '@/lib/demo-utils';
import { serializeEvent, type EventLean } from '@/lib/serialize';
import { getPostHogClient } from '@/lib/posthog-server';

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('demo-session-id')?.value;
    const isDemoActive = isDemoMode(cookieStore);

    await DBconnect(isDemoActive);

    const event = await Event.findOne({ slug });

    if (!event) return [];

    // Filter: Global events (isDemo: false) OR permanent demo events OR current user's demo events
    const query = {
      _id: { $ne: event._id },
      tags: { $in: event.tags },
      ...(isDemoActive
        ? { $or: [{ isDemo: false }, { isPermanent: true }, { sessionId: sessionId }] }
        : {}),
    };

    const events = await Event.find(query).limit(3).lean<EventLean[]>();

    return events.map(serializeEvent);
  } catch (e) {
    console.error('Error fetching similar events:', e);
    getPostHogClient().captureException(e);
    return [];
  }
};

export const getAllEvents = async () => {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('demo-session-id')?.value;
    const isDemoActive = isDemoMode(cookieStore);

    await DBconnect(isDemoActive);

    // Filter: Global events (isDemo: false) OR permanent demo events OR current user's demo events
    const query = isDemoActive
      ? { $or: [{ isDemo: false }, { isPermanent: true }, { sessionId: sessionId }] }
      : {};

    const events = await Event.find(query).sort({ createdAt: -1 }).lean<EventLean[]>();

    return events.map(serializeEvent);
  } catch (e) {
    console.error('Error fetching events:', e);
    getPostHogClient().captureException(e);
    return [];
  }
};

export const getEventBySlug = async (slug: string) => {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('demo-session-id')?.value;
    const isDemoActive = isDemoMode(cookieStore);

    await DBconnect(isDemoActive);

    const event = await Event.findOne({ slug }).lean<EventLean>();

    if (!event) return null;

    // Security check for demo mode: if it's a demo event, it must belong to current session or be permanent
    if (isDemoActive && event.isDemo && !event.isPermanent && event.sessionId !== sessionId) {
      return null;
    }

    return serializeEvent(event);
  } catch (e) {
    console.error('Error fetching event by slug:', e);
    getPostHogClient().captureException(e);
    return null;
  }
};
