import type { SpotifyPlaylist } from "@/types/playlist";

// Browser-side Spotify helpers. They call Festify's own API routes, which hold
// the app token server-side (see lib/spotify-server.ts).

export async function searchPlaylists(
  query: string,
  options?: {
    appendFestival?: boolean;
    limit?: number;
  }
): Promise<SpotifyPlaylist[]> {
  const params = new URLSearchParams({
    q: query,
    festival: options?.appendFestival === false ? "0" : "1",
    limit: String(options?.limit ?? 15),
  });
  const response = await fetch(`/api/spotify/search?${params}`);

  if (!response.ok) {
    throw new Error(`Spotify search failed: ${response.status}`);
  }

  const data = (await response.json()) as { playlists?: SpotifyPlaylist[] };
  return data.playlists ?? [];
}

export async function getArtistTopTracks<T>(args: {
  spotifyArtistId?: string | null;
  artistName: string;
}): Promise<T[]> {
  const params = new URLSearchParams();
  // Malformed stored ids fall back to a name lookup instead of a 400.
  if (args.spotifyArtistId && /^[A-Za-z0-9]{22}$/.test(args.spotifyArtistId)) {
    params.set("artistId", args.spotifyArtistId);
  }
  else params.set("name", args.artistName);

  const response = await fetch(`/api/spotify/top-tracks?${params}`);
  if (!response.ok) {
    throw new Error(`Spotify top tracks failed: ${response.status}`);
  }

  const data = (await response.json()) as { tracks?: T[] };
  return data.tracks ?? [];
}
