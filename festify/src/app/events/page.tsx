import { createClient } from "@/lib/supabase/server";
import { EventGrid } from "@/components/events/EventGrid";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { attachArtistsToEvents } from "@/lib/event-data";
import type { Artist } from "@/types/artist";
import type { Event } from "@/types/event";

export const metadata = {
  title: "Events | Festify",
  description: "Browse upcoming EDM festivals and electronic music events.",
};

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
  }

  const eventIds = ((events as Event[] | null) ?? []).map((event) => event.event_id);

  const { data: gigs } = eventIds.length
    ? await supabase
        .from("gigs")
        .select("event_id, artists(*)")
        .in("event_id", eventIds)
    : { data: null };

  const enrichedEvents = attachArtistsToEvents(
    (events as Event[]) ?? [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (gigs as any[] | null)?.map((gig) => ({
      event_id: gig.event_id,
      artists: gig.artists as Artist | null,
    })) ?? null
  );

  return (
    <div className="relative pt-24 pb-16 px-4">
      <GradientBackground variant="subtle" />
      <div className="max-w-7xl mx-auto relative">
        <h1 className="font-brand text-4xl sm:text-5xl text-white mb-2">
          Events
        </h1>
        <p className="text-muted-foreground mb-8">
          Search by date, event type, and location to get to the right night faster
        </p>

        <EventGrid events={enrichedEvents} />
      </div>
    </div>
  );
}
