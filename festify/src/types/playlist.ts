export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: { url: string; height: number | null; width: number | null }[];
  external_urls: { spotify: string };
  tracks: { total: number };
  owner: { display_name: string };
}
