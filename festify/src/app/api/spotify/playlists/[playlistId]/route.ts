import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  removeSavedPlaylistForUser,
  savePlaylistForUser,
} from "@/lib/spotify-server";

interface RouteContext {
  params: Promise<{ playlistId: string }>;
}

const PLAYLIST_ID_PATTERN = /^[A-Za-z0-9]{22}$/;

function isAllowedSpotifyUrl(value: string, playlistId: string) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname === "open.spotify.com" &&
      url.pathname === `/playlist/${playlistId}`
    );
  } catch {
    return false;
  }
}

function clampText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.slice(0, maxLength) : null;
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
  if (!PLAYLIST_ID_PATTERN.test(playlistId)) {
    return NextResponse.json({ error: "Invalid playlist id" }, { status: 400 });
  }

  let body: {
    name?: unknown;
    description?: unknown;
    imageUrl?: unknown;
    spotifyUrl?: unknown;
    ownerName?: unknown;
    trackTotal?: unknown;
    artistName?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = clampText(body?.name, 200);
  if (!name || typeof body.spotifyUrl !== "string") {
    return NextResponse.json(
      { error: "Missing playlist metadata" },
      { status: 400 }
    );
  }

  if (!isAllowedSpotifyUrl(body.spotifyUrl, playlistId)) {
    return NextResponse.json(
      { error: "Invalid Spotify URL" },
      { status: 400 }
    );
  }

  try {
    const result = await savePlaylistForUser(user.id, {
      playlistId,
      name,
      description: clampText(body.description, 1000),
      imageUrl: sanitizeSpotifyImageUrl(clampText(body.imageUrl, 1000)),
      spotifyUrl: body.spotifyUrl,
      ownerName: clampText(body.ownerName, 200),
      trackTotal:
        typeof body.trackTotal === "number" && Number.isFinite(body.trackTotal)
          ? body.trackTotal
          : undefined,
      artistName: clampText(body.artistName, 200),
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
  if (!PLAYLIST_ID_PATTERN.test(playlistId)) {
    return NextResponse.json({ error: "Invalid playlist id" }, { status: 400 });
  }

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
