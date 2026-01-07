import { NextRequest, NextResponse } from "next/server";
import DBconnect from "@/lib/mongodb";
import Event from "@/database/event.model";
import { isDemoMode } from "@/lib/demo-utils";

/**
 * GET API route to fetch event details by slug.
 * Path: /api/events/[slug]
 * 
 * @param req - NextRequest object
 * @param context - Context object containing dynamic route parameters
 * @returns JSON response with event data or error message
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Await the params since it's a dynamic route in Next.js 15+
    const { slug } = await params;

    // Validate slug
    if (!slug) {
      return NextResponse.json(
        { message: "Slug parameter is missing" },
        { status: 400 }
      );
    }

    const sessionId = req.cookies.get('demo-session-id')?.value;
    const isDemoActive = isDemoMode(req.cookies);

    // Connect to the database
    await DBconnect(isDemoActive);

    // Query the database for the event with the matching slug
    const event = await Event.findOne({ slug }).lean();

    // If no event is found, return 404
    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    // Security check for demo mode: if it's a demo event, it must belong to current session
    if (isDemoActive && (event as any).isDemo && (event as any).sessionId !== sessionId) {
      return NextResponse.json(
        { message: "Access denied to this demo event" },
        { status: 403 }
      );
    }

    // Convert _id and dates to string to ensure safe serialization
    const serializedEvent = {
      ...event,
      _id: (event as any)._id.toString(),
      createdAt: (event as any).createdAt?.toISOString(),
      updatedAt: (event as any).updatedAt?.toISOString(),
    };

    // Return the found event
    return NextResponse.json(
      {
        message: "Event fetched successfully",
        event: serializedEvent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching event by slug:", error);

    // Handle unexpected errors
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
