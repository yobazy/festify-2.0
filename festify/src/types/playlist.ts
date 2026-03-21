export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: { url: string; height: number | null; width: number | null }[];
  external_urls: { spotify: string };
  tracks: { total: number };
  owner: { display_name: string };
}

export interface SavedPlaylist {
  id: number;
  playlist_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  spotify_url: string;
  owner_name: string | null;
  track_total: number;
  artist_name: string | null;
  created_at: string;
}
