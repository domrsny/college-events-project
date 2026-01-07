import { NextRequest, NextResponse } from "next/server";
import DBconnect from "@/lib/mongodb";
import Event from "@/database/event.model";

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

    // Connect to the database
    await DBconnect();

    // Query the database for the event with the matching slug
    const event = await Event.findOne({ slug });

    // If no event is found, return 404
    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    // Return the found event
    return NextResponse.json(
      {
        message: "Event fetched successfully",
        event,
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
