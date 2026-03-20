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
