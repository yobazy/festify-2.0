import type { Artist } from "@/types/artist";
import type { Event } from "@/types/event";

interface GigRow {
  event_id: number;
  artists: Artist | null;
}

export function attachArtistsToEvents(
  events: Event[],
  gigRows: GigRow[] | null
): Event[] {
  const artistsByEvent = new Map<number, Artist[]>();

  gigRows?.forEach((row) => {
    if (!row.artists) return;

    const existingArtists = artistsByEvent.get(row.event_id) ?? [];
    const alreadyIncluded = existingArtists.some(
      (artist) => artist.artist_id === row.artists?.artist_id
    );

    if (alreadyIncluded) return;

    artistsByEvent.set(row.event_id, [...existingArtists, row.artists]);
  });

  return events.map((event) => ({
    ...event,
    artists: artistsByEvent.get(event.event_id) ?? [],
  }));
}

export function getEventPopularityScore(
  event: Pick<Event, "event_date" | "festivalind" | "popularity_score"> & {
    artists?: Array<Pick<Artist, "popularity">>;
  }
) {
  if (typeof event.popularity_score === "number") {
    return event.popularity_score;
  }

  const artistPopularities = (event.artists ?? [])
    .map((artist) => artist.popularity ?? 0)
    .filter((value) => value > 0)
    .sort((a, b) => b - a);

  const headlinerScore = artistPopularities[0] ?? 0;
  const supportActs = artistPopularities.slice(1, 4);
  const supportAverage = supportActs.length
    ? supportActs.reduce((sum, value) => sum + value, 0) / supportActs.length
    : 0;
  const notableArtists = artistPopularities.filter((value) => value >= 55).length;
  const lineupDepthScore = Math.min(
    notableArtists * 4 + Math.min(artistPopularities.length, 7),
    15
  );
  const festivalBonus = event.festivalind ? 8 : 0;
  const daysAway = getDaysAway(event.event_date);
  const timeBonus =
    daysAway < 0
      ? 0
      : daysAway <= 14
      ? 7
      : daysAway <= 30
      ? 5
      : daysAway <= 60
      ? 3
      : 0;

  return Math.round(
    Math.min(
      100,
      headlinerScore * 0.6 +
        supportAverage * 0.25 +
        lineupDepthScore +
        festivalBonus +
        timeBonus
    )
  );
}

export function getEventPopularityTier(score: number) {
  if (score >= 85) return "Peak draw";
  if (score >= 70) return "Hot ticket";
  if (score >= 55) return "On the rise";
  return "Discovery pick";
}

export function sortEventsByPopularity(events: Event[]) {
  return [...events].sort((a, b) => {
    const popularityDelta = getEventPopularityScore(b) - getEventPopularityScore(a);
    if (popularityDelta !== 0) {
      return popularityDelta;
    }

    return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
  });
}

export function getEventLocationLabel(
  event: Pick<Event, "event_location" | "event_venue">
) {
  const venue = normalizeEventText(event.event_venue);
  const location = normalizeEventText(event.event_location);

  if (venue && location) {
    return `${venue}, ${location}`;
  }

  return venue ?? location;
}

export function hasEventLocation(
  event: Pick<Event, "event_location" | "event_venue">
) {
  return Boolean(getEventLocationLabel(event));
}

function normalizeEventText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getDaysAway(dateString: string) {
  const target = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return Math.round(
    (target.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
  );
}
