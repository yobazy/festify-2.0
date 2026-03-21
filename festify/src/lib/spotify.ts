import type { SpotifyPlaylist } from "@/types/playlist";

export async function getSpotifyToken(): Promise<string> {
  const res = await fetch("/api/spotify/token", { method: "POST" });
  if (!res.ok) {
    throw new Error("Failed to fetch Spotify token");
  }
  const data = await res.json();
  return data.access_token;
}

export async function searchPlaylists(
  query: string,
  accessToken: string,
  options?: {
    appendFestival?: boolean;
    limit?: number;
  }
): Promise<SpotifyPlaylist[]> {
  let searchQuery = query;
  const shouldAppendFestival = options?.appendFestival ?? true;

  if (
    shouldAppendFestival &&
    !searchQuery.toLowerCase().includes("festival") &&
    !searchQuery.toLowerCase().includes("fest")
  ) {
    searchQuery += " festival";
  }

  const limit = options?.limit ?? 15;
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=playlist&limit=${limit}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Spotify search failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.playlists?.items ?? [];
}

export async function searchArtist(
  artistName: string,
  accessToken: string
) {
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data.artists?.items?.[0] ?? null;
}

export async function getArtistTopTracks(
  artistId: string,
  accessToken: string
) {
  const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return [];

  const data = await response.json();
  return data.tracks ?? [];
}
