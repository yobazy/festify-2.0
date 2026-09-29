import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { fetchUpcomingEventsForArtists } from "@/lib/event-queries";

const MAX_ARTISTS = 50;

/** Upcoming events for the artists a visitor follows (taste lives client-side). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistIds = (searchParams.get("ids") ?? "")
    .split(",")
    .filter((value) => /^\d+$/.test(value))
    .map(Number)
    .slice(0, MAX_ARTISTS);

  if (artistIds.length === 0) {
    return NextResponse.json({ events: [] });
  }

  try {
    const supabase = createPublicClient();
    const events = await fetchUpcomingEventsForArtists(supabase, artistIds);

    return NextResponse.json(
      { events },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } }
    );
  } catch (error) {
    console.error("Failed to load events for followed artists", error);
    return NextResponse.json({ error: "Failed to load events" }, { status: 502 });
  }
}
