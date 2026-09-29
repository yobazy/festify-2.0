import { createClient } from "@/lib/supabase/server";
import { fetchAllUpcomingEvents, withLineups } from "@/lib/event-queries";
import { EventGrid } from "@/components/events/EventGrid";
import { GradientBackground } from "@/components/ui/GradientBackground";

export const metadata = {
  title: "Events",
  description: "Browse upcoming EDM festivals and electronic music events.",
};

export default async function EventsPage() {
  const supabase = await createClient();

  // Throws on Supabase errors so outages render error.tsx, not an empty grid.
  const enrichedEvents = await withLineups(
    supabase,
    await fetchAllUpcomingEvents(supabase)
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
