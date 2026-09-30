import { SectionHead } from "@/components/ui/SectionHead";
import { EventRow } from "@/components/events/EventRow";
import type { Event } from "@/types/event";

interface UpcomingEventsProps {
  events: Event[];
}

/** Where to catch them next: a ledger of upcoming shows. */
export function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) return null;

  return (
    <section className="py-14">
      <SectionHead title="Dates" aside={{ href: "/events", label: "All shows" }} />
      <div className="mt-2">
        {events.map((event) => (
          <EventRow key={event.event_id} event={event} />
        ))}
      </div>
    </section>
  );
}
