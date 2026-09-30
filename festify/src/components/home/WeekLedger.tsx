import { formatEventDate } from "@/lib/dates";
import { EventRow } from "@/components/events/EventRow";
import { SectionHead } from "@/components/ui/SectionHead";
import type { Event } from "@/types/event";

interface WeekLedgerProps {
  events: Event[];
  title: string;
  note?: string;
}

/** Shows grouped by day, ledger-style. */
export function WeekLedger({ events, title, note }: WeekLedgerProps) {
  if (events.length === 0) return null;

  const days = new Map<string, Event[]>();
  events.forEach((event) => {
    const list = days.get(event.event_date) ?? [];
    list.push(event);
    days.set(event.event_date, list);
  });

  return (
    <section className="page py-14">
      <SectionHead
        title={title}
        note={note}
        aside={{ href: "/events", label: "All shows" }}
      />

      <div className="mt-6">
        {Array.from(days.entries()).map(([date, dayEvents]) => (
          <div
            key={date}
            className="grid grid-cols-[minmax(0,1fr)] gap-x-6 md:grid-cols-[8rem_minmax(0,1fr)]"
          >
            <h3 className="meta-strong sticky top-14 z-20 bg-ink py-3 md:static md:pt-4">
              <span className="block text-paper">
                {formatEventDate(date, { weekday: "long" })}
              </span>
              <span className="block text-smoke">
                {formatEventDate(date, { day: "2-digit", month: "long" })}
              </span>
            </h3>
            <div>
              {dayEvents.map((event) => (
                <EventRow key={event.event_id} event={event} showDate={false} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
