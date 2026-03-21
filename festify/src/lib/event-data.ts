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
