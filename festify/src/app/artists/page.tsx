import { createClient } from "@/lib/supabase/server";
import { ArtistGrid } from "@/components/artists/ArtistGrid";
import type { Artist } from "@/types/artist";

export const metadata = {
  title: "Artists",
  description: "Every artist on an upcoming bill, ranked by popularity. Filter by genre.",
};

export default async function ArtistsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .order("popularity", { ascending: false, nullsFirst: false });

  // Throws on Supabase errors so outages render error.tsx, not an empty grid.
  if (error) throw new Error(`Error fetching artists: ${error.message}`);

  const artists = (data as Artist[]) ?? [];

  return (
    <div className="page pb-16 pt-10 sm:pt-14">
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="display text-6xl text-paper sm:text-8xl">Artists</h1>
        <p className="meta-strong sm:text-right">
          <span className="block">
            {artists.length} {artists.length === 1 ? "artist" : "artists"}
          </span>
          <span className="block text-smoke">ranked by popularity</span>
        </p>
      </div>

      <ArtistGrid artists={artists} />
    </div>
  );
}
