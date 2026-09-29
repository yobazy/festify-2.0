import { createClient } from "@/lib/supabase/server";
import { upcomingEventsFilter } from "@/lib/dates";
import { DiscoveryPaths } from "@/components/home/DiscoveryPaths";
import { HeroSection } from "@/components/home/HeroSection";
import { PersonalizedHomeSections } from "@/components/home/PersonalizedHomeSections";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { withLineups } from "@/lib/event-queries";
import type { Artist } from "@/types/artist";
import type { Event } from "@/types/event";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [eventsResult, artistsResult] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .or(upcomingEventsFilter())
      .order("event_date", { ascending: true })
      // Wide pool for "For you" scoring; followed artists' later shows come
      // from /api/events/for-artists on the client.
      .limit(60),
    supabase
      .from("artists")
      .select("*")
      .order("popularity", { ascending: false, nullsFirst: false })
      .limit(20),
  ]);

  // Same policy as /events: outages render error.tsx instead of empty sections.
  if (eventsResult.error) {
    throw new Error(`Error fetching events: ${eventsResult.error.message}`);
  }
  if (artistsResult.error) {
    throw new Error(`Error fetching artists: ${artistsResult.error.message}`);
  }

  const enrichedEvents = await withLineups(
    supabase,
    (eventsResult.data as Event[] | null) ?? []
  );
  const artists = artistsResult.data;

  return (
    <>
      <HeroSection />
      <DiscoveryPaths />
      <PersonalizedHomeSections
        events={enrichedEvents}
        artists={(artists as Artist[]) ?? []}
        isSignedIn={Boolean(user)}
      />
      <div className="relative">
        <GradientBackground variant="section" />
        <FeaturedEvents events={enrichedEvents} />
      </div>
    </>
  );
}
