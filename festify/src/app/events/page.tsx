import { createClient } from "@/lib/supabase/server";
import { EventGrid } from "@/components/events/EventGrid";
import { GradientBackground } from "@/components/ui/GradientBackground";
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

  return (
    <div className="relative pt-24 pb-16 px-4">
      <GradientBackground variant="subtle" />
      <div className="max-w-7xl mx-auto relative">
        <h1 className="font-brand text-4xl sm:text-5xl text-white mb-2">
          Events
        </h1>
        <p className="text-muted-foreground mb-8">
          Discover upcoming festivals and electronic music events
        </p>

        <EventGrid events={(events as Event[]) ?? []} />
      </div>
    </div>
  );
}
