import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { GradientBackground } from "@/components/ui/GradientBackground";
import type { Event } from "@/types/event";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true })
    .limit(6);

  return (
    <>
      <HeroSection />
      <div className="relative">
        <GradientBackground variant="section" />
        <FeaturedEvents events={(events as Event[]) ?? []} />
      </div>
    </>
  );
}
