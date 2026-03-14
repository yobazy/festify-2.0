export interface Artist {
  artist_id: number;
  artist_name: string;
  img_url: string | null;
  genres: string[] | null;
  popularity: number | null;
  spotify_link: string | null;
}
