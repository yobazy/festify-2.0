import { createClient } from "@/lib/supabase/server";
import { DiscoveryPaths } from "@/components/home/DiscoveryPaths";
import { PersonalizedHomeSections } from "@/components/home/PersonalizedHomeSections";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { attachArtistsToEvents } from "@/lib/event-data";
import type { Artist } from "@/types/artist";
import type { Event } from "@/types/event";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true })
    .limit(12);

  const eventIds = ((events as Event[] | null) ?? []).map((event) => event.event_id);

  const { data: gigs } = eventIds.length
    ? await supabase
        .from("gigs")
        .select("event_id, artists(*)")
        .in("event_id", eventIds)
    : { data: null };

  const { data: artists } = await supabase
    .from("artists")
    .select("*")
    .order("popularity", { ascending: false, nullsFirst: false })
    .limit(20);

  const enrichedEvents = attachArtistsToEvents(
    (events as Event[]) ?? [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (gigs as any[] | null)?.map((gig) => ({
      event_id: gig.event_id,
      artists: gig.artists as Artist | null,
    })) ?? null
  );

  return (
    <>
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
