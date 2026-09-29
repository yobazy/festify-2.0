import { NextResponse } from "next/server";
import { getTopTracksForArtist } from "@/lib/spotify-server";

const SPOTIFY_ID_PATTERN = /^[A-Za-z0-9]{22}$/;
const MAX_NAME_LENGTH = 120;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get("artistId");
  const name = searchParams.get("name")?.trim() ?? "";

  if (artistId && !SPOTIFY_ID_PATTERN.test(artistId)) {
    return NextResponse.json({ error: "Invalid artist id" }, { status: 400 });
  }
  if (!artistId && (!name || name.length > MAX_NAME_LENGTH)) {
    return NextResponse.json({ error: "Missing artist" }, { status: 400 });
  }

  try {
    const tracks = await getTopTracksForArtist({
      spotifyArtistId: artistId,
      artistName: name || null,
    });

    return NextResponse.json(
      { tracks },
      { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } }
    );
  } catch (error) {
    console.error("Spotify top tracks failed", error);
    return NextResponse.json({ error: "Spotify lookup failed" }, { status: 502 });
  }
}
