import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EventHeader } from "@/components/event-detail/EventHeader";
import { EventLineup } from "@/components/event-detail/EventLineup";
import { PlaylistCarousel } from "@/components/event-detail/PlaylistCarousel";
import { GradientBackground } from "@/components/ui/GradientBackground";
import type { Event } from "@/types/event";
import type { Artist } from "@/types/artist";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("event_name, event_venue, event_location")
    .eq("event_id", id)
    .single();

  if (!event) return { title: "Event Not Found | Festify" };

  return {
    title: `${event.event_name} | Festify`,
    description: `${event.event_name} at ${event.event_venue}, ${event.event_location}. Discover the lineup and Spotify playlists.`,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch event
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("event_id", id)
    .single();

  if (!event) notFound();

  // Fetch artists via gigs junction (single query, no N+1)
  const { data: gigs } = await supabase
    .from("gigs")
    .select("artists(*)")
    .eq("event_id", id);

  const artistMap = new Map<number, Artist>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (gigs as any[] | null)
    ?.map((g) => g.artists as Artist | null)
    .filter((a): a is Artist => a !== null)
    .forEach((artist) => {
      const existing = artistMap.get(artist.artist_id);

      if (!existing) {
        artistMap.set(artist.artist_id, artist);
        return;
      }

      // Keep the richer artist record if duplicates appear through the junction.
      artistMap.set(artist.artist_id, {
        ...existing,
        ...artist,
        genres: artist.genres ?? existing.genres,
        img_url: artist.img_url ?? existing.img_url,
        popularity: artist.popularity ?? existing.popularity,
        spotify_link: artist.spotify_link ?? existing.spotify_link,
      });
    });

  const artists = Array.from(artistMap.values()).sort((a, b) => {
    const popularityA = a.popularity ?? -1;
    const popularityB = b.popularity ?? -1;

    if (popularityA !== popularityB) {
      return popularityB - popularityA;
    }

    return a.artist_name.localeCompare(b.artist_name);
  });

  return (
    <>
      <EventHeader event={event as Event} />

      <div className="relative">
        <GradientBackground variant="subtle" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <PlaylistCarousel eventName={(event as Event).event_name} />
          <EventLineup artists={artists} />
        </div>
      </div>
    </>
  );
}
