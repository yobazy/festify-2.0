import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  removeSavedPlaylistForUser,
  savePlaylistForUser,
} from "@/lib/spotify-server";

interface RouteContext {
  params: Promise<{ playlistId: string }>;
}

function isAllowedSpotifyUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "https:" && url.hostname === "open.spotify.com";
  } catch {
    return false;
  }
}

function sanitizeSpotifyImageUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const isAllowedHost =
      url.hostname.endsWith(".scdn.co") ||
      url.hostname === "i.scdn.co" ||
      url.hostname.endsWith(".spotifycdn.com");

    if (url.protocol !== "https:" || !isAllowedHost) {
      return null;
    }

    return value;
  } catch {
    return null;
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { playlistId } = await params;
  const body = (await request.json()) as {
    name?: string;
    description?: string | null;
    imageUrl?: string | null;
    spotifyUrl?: string;
    ownerName?: string | null;
    trackTotal?: number;
    artistName?: string | null;
  };

  if (!body.name || !body.spotifyUrl) {
    return NextResponse.json(
      { error: "Missing playlist metadata" },
      { status: 400 }
    );
  }

  if (!isAllowedSpotifyUrl(body.spotifyUrl)) {
    return NextResponse.json(
      { error: "Invalid Spotify URL" },
      { status: 400 }
    );
  }

  try {
    const result = await savePlaylistForUser(user.id, {
      playlistId,
      name: body.name,
      description: body.description,
      imageUrl: sanitizeSpotifyImageUrl(body.imageUrl),
      spotifyUrl: body.spotifyUrl,
      ownerName: body.ownerName,
      trackTotal: body.trackTotal,
      artistName: body.artistName,
    });

    return NextResponse.json({
      saved: true,
      ...result,
    });
  } catch (error) {
    console.error("Failed to save playlist", error);
    return NextResponse.json(
      { error: "Failed to save playlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { playlistId } = await params;

  try {
    const result = await removeSavedPlaylistForUser(user.id, playlistId);

    return NextResponse.json({
      saved: false,
      ...result,
    });
  } catch (error) {
    console.error("Failed to remove playlist", error);
    return NextResponse.json(
      { error: "Failed to remove playlist" },
      { status: 500 }
    );
  }
}
