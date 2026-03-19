import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { PopularFestivals } from "@/components/home/PopularFestivals";
import { GradientBackground } from "@/components/ui/GradientBackground";
import type { Event } from "@/types/event";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: events }, { data: festivals }] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })
      .limit(6),
    supabase
      .from("events")
      .select("*")
      .eq("festivalInd", true)
      .order("event_date", { ascending: true })
      .limit(10),
  ]);

  return (
    <>
      <HeroSection />
      <div className="relative">
        <GradientBackground variant="section" />
        <FeaturedEvents events={(events as Event[]) ?? []} />
        <PopularFestivals festivals={(festivals as Event[]) ?? []} />
      </div>
    </>
  );
}
