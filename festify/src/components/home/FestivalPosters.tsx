import { EventCard } from "@/components/events/EventCard";
import { SectionHead } from "@/components/ui/SectionHead";
import type { Event } from "@/types/event";

interface FestivalPostersProps {
  festivals: Event[];
}

export function FestivalPosters({ festivals }: FestivalPostersProps) {
  if (festivals.length === 0) return null;

  return (
    <section className="page py-14">
      <SectionHead
        title="Festivals"
        note="Ranked by the whole bill, not the headliner alone."
        aside={{ href: "/events?type=festival", label: "All festivals" }}
      />
      <div className="mt-6 tile-grid sm:grid-cols-2 lg:grid-cols-3">
        {festivals.map((festival) => (
          <EventCard key={festival.event_id} event={festival} />
        ))}
      </div>
    </section>
  );
}
