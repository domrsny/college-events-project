import {NextRequest, NextResponse} from "next/server";
import {v2 as cloudinary} from 'cloudinary';

import DBconnect from "@/lib/mongodb"
import Event from "@/database/event.model";
import { isDemoMode } from "@/lib/demo-utils";


export async function POST(req: NextRequest) {
    try {
        const sessionId = req.cookies.get('demo-session-id')?.value;
        const isDemo = isDemoMode(req.cookies);

        await DBconnect(isDemo);

        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch(e) {
            return NextResponse.json({ message: 'Invalid JSON data format'}, { status: 400 })
        }

        const file = formData.get('image') as File;

        if(!file) return NextResponse.json({ message: 'Image file is required'}, { status: 400 })

        let tags;
        let agenda;

        try {
            const tagsData = formData.get('tags');
            if (!tagsData) {
                return NextResponse.json({ message: 'Tags are required' }, { status: 400 });
            }
            tags = JSON.parse(tagsData as string);
        } catch (e) {
            return NextResponse.json({ message: 'Invalid JSON for tags' }, { status: 400 });
        }

        try {
            const agendaData = formData.get('agenda');
            if (!agendaData) {
                return NextResponse.json({ message: 'Agenda is required' }, { status: 400 });
            }
            agenda = JSON.parse(agendaData as string);
        } catch (e) {
            return NextResponse.json({ message: 'Invalid JSON for agenda' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'CollegeEvent' }, (error, result) => {
                if(error) {
                    return reject(error);
                }
                return resolve(result);
            }).end(buffer);
        });

        event.image = (uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
            isDemo: isDemo,
            sessionId: isDemo ? sessionId : undefined,
        })

        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 })
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown'}, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const sessionId = req.cookies.get('demo-session-id')?.value;
        const isDemoActive = isDemoMode(req.cookies);

        await DBconnect(isDemoActive);

        // Filter: Global events (isDemo: false) OR current user's demo events
        const query = isDemoActive 
            ? { $or: [{ isDemo: false }, { sessionId: sessionId }] }
            : {};

        const events = await Event.find(query).sort({ createdAt: -1 }).lean();

        const serializedEvents = events.map((event: any) => ({
            ...event,
            _id: event._id.toString(),
            createdAt: event.createdAt?.toISOString(),
            updatedAt: event.updatedAt?.toISOString(),
        }));

        return NextResponse.json({ message: 'Events fetched successfully', events: serializedEvents }, { status: 200 });
    } catch (e) {
        console.error('Error fetching events:', e);
        return NextResponse.json({ message: 'Event fetching failed', error: e instanceof Error ? e.message : 'Unknown error'}, { status: 500 })
    }
}

