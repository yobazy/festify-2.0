import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArtistHero } from "@/components/artist-detail/ArtistHero";
import { UpcomingEvents } from "@/components/artist-detail/UpcomingEvents";
import { GradientBackground } from "@/components/ui/GradientBackground";
import type { Artist } from "@/types/artist";
import type { Event } from "@/types/event";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: artist } = await supabase
    .from("artists")
    .select("artist_name")
    .eq("artist_id", id)
    .single();

  if (!artist) return { title: "Artist Not Found | Festify" };

  return {
    title: `${artist.artist_name} | Festify`,
    description: `Discover ${artist.artist_name} — upcoming events, genres, and Spotify profile.`,
  };
}

export default async function ArtistDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch artist
  const { data: artist } = await supabase
    .from("artists")
    .select("*")
    .eq("artist_id", id)
    .single();

  if (!artist) notFound();

  // Fetch events for this artist via gigs junction
  const { data: gigs } = await supabase
    .from("gigs")
    .select("events(*)")
    .eq("artist_id", id);

  const events: Event[] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (gigs as any[] | null)
      ?.map((g) => g.events as Event | null)
      .filter((e): e is Event => e !== null)
      .sort(
        (a, b) =>
          new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      ) ?? [];

  return (
    <>
      <ArtistHero artist={artist as Artist} />

      <div className="relative">
        <GradientBackground variant="subtle" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <UpcomingEvents events={events} />
        </div>
      </div>
    </>
  );
}
