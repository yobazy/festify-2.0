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

  const artists: Artist[] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (gigs as any[] | null)
      ?.map((g) => g.artists as Artist | null)
      .filter((a): a is Artist => a !== null) ?? [];

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
