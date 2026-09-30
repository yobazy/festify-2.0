import type { Artist } from "@/types/artist";
import type { Event } from "@/types/event";

/** Lineup ordered like a poster: biggest name first, ties alphabetical. */
export function rankLineup<T extends Pick<Artist, "artist_name" | "popularity">>(
  artists: T[] | null | undefined
): T[] {
  return [...(artists ?? [])].sort((a, b) => {
    const delta = (b.popularity ?? -1) - (a.popularity ?? -1);
    return delta !== 0 ? delta : a.artist_name.localeCompare(b.artist_name);
  });
}

export interface BillingTiers<T> {
  headliners: T[];
  support: T[];
  undercard: T[];
  rest: T[];
}

/**
 * Split a ranked lineup into poster tiers. Sizes scale with the bill: a
 * three-act club night is all headliners; a festival gets four tiers.
 */
export function billingTiers<T>(ranked: T[]): BillingTiers<T> {
  const n = ranked.length;
  if (n <= 3) {
    return { headliners: ranked, support: [], undercard: [], rest: [] };
  }

  const headlinerCount = Math.min(3, Math.max(1, Math.round(n * 0.15)));
  const supportCount = Math.min(5, Math.max(2, Math.round(n * 0.25)));
  const undercardCount = Math.min(10, Math.max(3, Math.round(n * 0.3)));

  return {
    headliners: ranked.slice(0, headlinerCount),
    support: ranked.slice(headlinerCount, headlinerCount + supportCount),
    undercard: ranked.slice(
      headlinerCount + supportCount,
      headlinerCount + supportCount + undercardCount
    ),
    rest: ranked.slice(headlinerCount + supportCount + undercardCount),
  };
}

export function getHeadliner(event: Pick<Event, "artists">) {
  return rankLineup(event.artists)[0] ?? null;
}

/**
 * Many listings are titled after the acts ("Tinlicker, Helsloot"). Billing
 * those names again under the title reads as a stutter, so drop any artist
 * the title already names.
 */
export function artistsNotNamedIn<T extends Pick<Artist, "artist_name">>(
  artists: T[] | null | undefined,
  title: string
): T[] {
  const haystack = title.toLowerCase();
  return (artists ?? []).filter(
    (artist) => !haystack.includes(artist.artist_name.toLowerCase())
  );
}

/**
 * "Four Tet, Floating Points, Ben UFO +9" for listings. When the title
 * already names the whole bill, fall back to what they play.
 */
export function lineupPreview(
  event: Pick<Event, "artists" | "event_name">,
  max = 3
) {
  const ranked = rankLineup(event.artists);
  if (ranked.length === 0) return null;

  const unnamed = artistsNotNamedIn(ranked, event.event_name);
  if (unnamed.length === 0) {
    const genres = new Set<string>();
    ranked.forEach((artist) => artist.genres?.forEach((genre) => genres.add(genre)));
    return genres.size > 0 ? Array.from(genres).slice(0, max).join(", ") : null;
  }

  const names = unnamed.slice(0, max).map((artist) => artist.artist_name);
  const more = unnamed.length - names.length;
  return more > 0 ? `${names.join(", ")} +${more}` : names.join(", ");
}

/**
 * Artists billed below the headliner across a set of events: the names a
 * real fan scans for. Popularity floor keeps the list to acts with a footprint.
 */
export function collectUndercard(events: Event[], limit = 12, floor = 30) {
  const seen = new Map<number, Artist>();

  events.forEach((event) => {
    const ranked = rankLineup(event.artists);
    ranked.slice(1).forEach((artist) => {
      if ((artist.popularity ?? 0) < floor) return;
      if (!seen.has(artist.artist_id)) seen.set(artist.artist_id, artist);
    });
  });

  return rankLineup(Array.from(seen.values())).slice(0, limit);
}
