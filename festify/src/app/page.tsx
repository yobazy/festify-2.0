import { createClient } from "@/lib/supabase/server";
import {
  addDaysToDateString,
  formatEventDate,
  getTodayDateString,
  upcomingEventsFilter,
} from "@/lib/dates";
import { hasEventLocation, sortEventsByPopularity } from "@/lib/event-data";
import { collectUndercard } from "@/lib/lineup";
import { withLineups } from "@/lib/event-queries";
import { HeroNight } from "@/components/home/HeroNight";
import { WeekLedger } from "@/components/home/WeekLedger";
import { Undercard } from "@/components/home/Undercard";
import { ForYou } from "@/components/home/ForYou";
import { FestivalPosters } from "@/components/home/FestivalPosters";
import type { Artist } from "@/types/artist";
import type { Event } from "@/types/event";

export default async function HomePage() {
  const supabase = await createClient();
  const today = getTodayDateString();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [eventsResult, artistsResult, countResult, festivalsResult] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .or(upcomingEventsFilter(today))
      .order("event_date", { ascending: true })
      // Wide pool for the lead, the week, and "Your bill" scoring; followed
      // artists' later shows come from /api/events/for-artists on the client.
      .limit(80),
    supabase
      .from("artists")
      .select("*")
      .order("popularity", { ascending: false, nullsFirst: false })
      .limit(40),
    supabase
      .from("events")
      .select("event_id", { count: "exact", head: true })
      .or(upcomingEventsFilter(today)),
    // Festivals are sparse in the date-ordered pool; rank them on their own.
    supabase
      .from("events")
      .select("*")
      .eq("festivalind", true)
      .or(upcomingEventsFilter(today))
      .order("popularity_score", { ascending: false, nullsFirst: false })
      .order("event_date", { ascending: true })
      .limit(12),
  ]);

  // Outages render error.tsx instead of empty sections.
  if (eventsResult.error) {
    throw new Error(`Error fetching events: ${eventsResult.error.message}`);
  }
  if (artistsResult.error) {
    throw new Error(`Error fetching artists: ${artistsResult.error.message}`);
  }
  if (festivalsResult.error) {
    throw new Error(`Error fetching festivals: ${festivalsResult.error.message}`);
  }

  const [events, festivalPool] = await Promise.all([
    withLineups(supabase, (eventsResult.data as Event[] | null) ?? []),
    withLineups(supabase, (festivalsResult.data as Event[] | null) ?? []),
  ]);
  const artists = (artistsResult.data as Artist[] | null) ?? [];
  const listedCount = countResult.count ?? events.length;

  const located = events.filter((event) => hasEventLocation(event));

  // The lead: strongest bill in the next two weeks, preferring one with a
  // photo (it's the front page), falling back to the strongest listed.
  const fortnight = addDaysToDateString(today, 14);
  const withBill = located.filter((event) => (event.artists?.length ?? 0) > 0);
  const hasPhoto = (event: Event) => Boolean(event.use_alt ? event.alt_img : event.img_url);
  const soonRanked = sortEventsByPopularity(
    withBill.filter((event) => event.event_date <= fortnight)
  );
  const hero =
    soonRanked.find(hasPhoto) ??
    soonRanked[0] ??
    sortEventsByPopularity(withBill).find(hasPhoto) ??
    sortEventsByPopularity(withBill)[0] ??
    located[0] ??
    null;
  const heroReason =
    hero && soonRanked.includes(hero)
      ? "Strongest bill in the next two weeks"
      : "Strongest bill listed";

  // This week: the next seven days; stretch to fourteen when the calendar is thin.
  const weekEnd = addDaysToDateString(today, 7);
  let week = located.filter(
    (event) => event.event_date <= weekEnd && event.event_id !== hero?.event_id
  );
  let weekTitle = "This week";
  if (week.length < 5) {
    week = located.filter(
      (event) => event.event_date <= fortnight && event.event_id !== hero?.event_id
    );
    weekTitle = "Next two weeks";
  }
  week = week.slice(0, 14);

  const undercard = collectUndercard(events, 12);

  const festivals = sortEventsByPopularity(
    festivalPool.filter(
      (event) => hasEventLocation(event) && event.event_id !== hero?.event_id
    )
  ).slice(0, 6);

  return (
    <>
      {hero ? (
        <HeroNight event={hero} reason={heroReason} />
      ) : (
        <section className="page border-b border-line pb-12 pt-24">
          <h1 className="display text-6xl text-paper sm:text-8xl">Front Left</h1>
          <p className="mt-6 max-w-md text-sm text-smoke">
            Nothing on yet. Shows sync from EDMTrain and Resident Advisor; check back
            shortly.
          </p>
        </section>
      )}

      <div className="page">
        <p className="meta flex flex-wrap gap-x-6 gap-y-1 border-b border-line py-3">
          <span className="text-paper">
            {formatEventDate(today, { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
          </span>
          <span>{listedCount} upcoming shows</span>
          <span>Ranked by the whole bill</span>
        </p>
      </div>

      <WeekLedger events={week} title={weekTitle} />
      <Undercard artists={undercard} />
      <ForYou events={events} artists={artists} isSignedIn={Boolean(user)} />
      <FestivalPosters festivals={festivals} />
    </>
  );
}
