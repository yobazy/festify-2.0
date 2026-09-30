import { createClient } from "@/lib/supabase/server";
import { fetchAllUpcomingEvents, withLineups } from "@/lib/event-queries";
import { formatEventDate, getTodayDateString } from "@/lib/dates";
import { EventGrid } from "@/components/events/EventGrid";

export const metadata = {
  title: "Shows",
  description:
    "Every upcoming show and festival, with the full bill. Filter by city, date, and type.",
};

export default async function EventsPage() {
  const supabase = await createClient();
  const today = getTodayDateString();

  // Throws on Supabase errors so outages render error.tsx, not an empty list.
  const events = await withLineups(supabase, await fetchAllUpcomingEvents(supabase));

  return (
    <div className="page pb-16 pt-10 sm:pt-14">
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="display text-6xl text-paper sm:text-8xl">Shows</h1>
        <p className="meta-strong sm:text-right">
          <span className="block">{events.length} upcoming</span>
          <span className="block text-smoke">
            from {formatEventDate(today, { weekday: "short", day: "2-digit", month: "short" })}
          </span>
        </p>
      </div>

      <EventGrid events={events} />
    </div>
  );
}
