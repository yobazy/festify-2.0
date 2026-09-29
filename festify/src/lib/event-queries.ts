import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { attachArtistsToEvents } from "@/lib/event-data";
import { getTodayDateString, isEventUpcoming, upcomingEventsFilter } from "@/lib/dates";
import type { Artist } from "@/types/artist";
import type { Event } from "@/types/event";

// PostgREST caps responses at 1000 rows by default; page explicitly instead of
// silently truncating.
const PAGE_SIZE = 1000;
// Keep `.in()` lists short enough that the request URL stays well under limits.
const IN_CHUNK_SIZE = 150;

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

/** Every upcoming (or still-running) event, ordered by start date. */
export async function fetchAllUpcomingEvents(supabase: SupabaseClient) {
  const today = getTodayDateString();
  const events: Event[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .or(upcomingEventsFilter(today))
      .order("event_date", { ascending: true })
      .order("event_id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`Error fetching events: ${error.message}`);

    events.push(...((data as Event[] | null) ?? []));
    if (!data || data.length < PAGE_SIZE) return events;
  }
}

/** Attach lineup artists to events, querying gigs in URL-safe batches. */
export async function withLineups(supabase: SupabaseClient, events: Event[]) {
  const eventIds = events.map((event) => event.event_id);
  const batches = await Promise.all(
    chunk(eventIds, IN_CHUNK_SIZE).map(async (ids) => {
      const { data, error } = await supabase
        .from("gigs")
        .select("event_id, artists(*)")
        .in("event_id", ids);

      if (error) throw new Error(`Error fetching lineups: ${error.message}`);
      return data ?? [];
    })
  );

  return attachArtistsToEvents(
    events,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (batches.flat() as any[]).map((gig) => ({
      event_id: gig.event_id,
      artists: gig.artists as Artist | null,
    }))
  );
}

/** Upcoming events that feature any of the given artists, with full lineups. */
export async function fetchUpcomingEventsForArtists(
  supabase: SupabaseClient,
  artistIds: number[],
  limit = 30
) {
  if (artistIds.length === 0) return [];

  const today = getTodayDateString();
  // Filter upcoming on the joined events in SQL so past gigs can't crowd out
  // upcoming ones under PostgREST's row cap.
  const { data, error } = await supabase
    .from("gigs")
    .select("events!inner(*)")
    .in("artist_id", artistIds)
    .or(upcomingEventsFilter(today), { referencedTable: "events" })
    .limit(1000);

  if (error) throw new Error(`Error fetching artist events: ${error.message}`);

  const byId = new Map<number, Event>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data as any[] | null)?.forEach((gig) => {
    const event = gig.events as Event | null;
    if (event && isEventUpcoming(event, today)) byId.set(event.event_id, event);
  });

  const events = Array.from(byId.values())
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, limit);

  return withLineups(supabase, events);
}
