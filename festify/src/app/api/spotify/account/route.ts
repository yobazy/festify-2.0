import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getSpotifyConnection,
  listSavedPlaylistIdsForUser,
} from "@/lib/spotify-server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        connected: false,
        savedPlaylistIds: [],
      },
      { status: 401 }
    );
  }

  const [spotifyConnection, savedPlaylistIds] = await Promise.all([
    getSpotifyConnection(user.id),
    listSavedPlaylistIdsForUser(user.id),
  ]);

  return NextResponse.json({
    connected: Boolean(spotifyConnection),
    savedPlaylistIds,
    spotifyDisplayName: spotifyConnection?.spotify_display_name ?? null,
  });
}
