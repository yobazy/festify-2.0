import { createClient } from "@/lib/supabase/server";
import { getTodayDateString, isEventUpcoming } from "@/lib/dates";
import { notFound } from "next/navigation";
import { ArtistHero } from "@/components/artist-detail/ArtistHero";
import { ArtistPlaylists } from "@/components/artist-detail/ArtistPlaylists";
import { ArtistTopTracks } from "@/components/artist-detail/ArtistTopTracks";
import { UpcomingEvents } from "@/components/artist-detail/UpcomingEvents";
import type { Artist } from "@/types/artist";
import type { Event } from "@/types/event";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return { title: "Artist not found" };

  const supabase = await createClient();
  const { data: artist } = await supabase
    .from("artists")
    .select("artist_name")
    .eq("artist_id", id)
    .maybeSingle();

  if (!artist) return { title: "Artist not found" };

  return {
    title: `${artist.artist_name}`,
    description: `${artist.artist_name}: upcoming dates, top tracks, and playlists.`,
  };
}

export default async function ArtistDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch artist
  if (!/^\d+$/.test(id)) notFound();

  const { data: artist, error: artistError } = await supabase
    .from("artists")
    .select("*")
    .eq("artist_id", id)
    .maybeSingle();

  // A missing row is a 404; anything else is an outage and belongs in error.tsx.
  if (artistError) throw new Error(`Error fetching artist: ${artistError.message}`);
  if (!artist) notFound();

  // Fetch upcoming events for this artist via gigs junction
  const today = getTodayDateString();
  const { data: gigs } = await supabase
    .from("gigs")
    .select("events(*)")
    .eq("artist_id", id);

  const events: Event[] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (gigs as any[] | null)
      ?.map((g) => g.events as Event | null)
      .filter((e): e is Event => e !== null && isEventUpcoming(e, today))
      .sort((a, b) => a.event_date.localeCompare(b.event_date)) ?? [];

  return (
    <>
      <ArtistHero artist={artist as Artist} />

      <div className="page">
        <ArtistTopTracks artist={artist as Artist} />
        <ArtistPlaylists artist={artist as Artist} isSignedIn={Boolean(user)} />
        <UpcomingEvents events={events} />
      </div>
    </>
  );
}
