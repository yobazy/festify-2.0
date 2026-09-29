import { NextResponse } from "next/server";
import { searchPlaylistsForQuery } from "@/lib/spotify-server";

// Public playlist search proxy: the app's Spotify token never leaves the server.
const MAX_QUERY_LENGTH = 120;
const MAX_LIMIT = 20;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const limit = Number(searchParams.get("limit") ?? 12);

  if (!query || query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  try {
    const playlists = await searchPlaylistsForQuery(query, {
      appendFestival: searchParams.get("festival") !== "0",
      limit: Number.isInteger(limit) ? Math.min(Math.max(limit, 1), MAX_LIMIT) : 12,
    });

    return NextResponse.json(
      { playlists },
      { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400" } }
    );
  } catch (error) {
    console.error("Spotify playlist search failed", error);
    return NextResponse.json({ error: "Spotify search failed" }, { status: 502 });
  }
}
