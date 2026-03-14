import { createClient } from "@/lib/supabase/server";
import { ArtistGrid } from "@/components/artists/ArtistGrid";
import { GradientBackground } from "@/components/ui/GradientBackground";
import type { Artist } from "@/types/artist";

export const metadata = {
  title: "Artists | Festify",
  description: "Explore electronic music artists, genres, and Spotify profiles.",
};

export default async function ArtistsPage() {
  const supabase = await createClient();

  const { data: artists } = await supabase
    .from("artists")
    .select("*")
    .order("popularity", { ascending: false, nullsFirst: false });

  return (
    <div className="relative pt-24 pb-16 px-4">
      <GradientBackground variant="subtle" />
      <div className="max-w-7xl mx-auto relative">
        <h1 className="font-brand text-4xl sm:text-5xl text-white mb-2">
          Artists
        </h1>
        <p className="text-muted-foreground mb-8">
          Explore the artists behind the festivals
        </p>

        <ArtistGrid artists={(artists as Artist[]) ?? []} />
      </div>
    </div>
  );
}
