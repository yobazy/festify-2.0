"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EventRow } from "@/components/events/EventRow";
import { SectionHead } from "@/components/ui/SectionHead";
import { useTasteStore } from "@/stores/tasteStore";
import { cn } from "@/lib/utils";
import type { Artist } from "@/types/artist";
import type { Event } from "@/types/event";

interface ForYouProps {
  events: Event[];
  artists: Artist[];
  isSignedIn: boolean;
}

/**
 * Taste lives on the device (tasteStore). Pick genres or follow artists and
 * this section fills with matching listings, including later dates for
 * followed artists fetched from /api/events/for-artists.
 */
export function ForYou({ events, artists, isSignedIn }: ForYouProps) {
  const followedArtists = useTasteStore((state) => state.followedArtists);
  const savedEvents = useTasteStore((state) => state.savedEvents);
  const preferredGenres = useTasteStore((state) => state.preferredGenres);
  const togglePreferredGenre = useTasteStore((state) => state.togglePreferredGenre);
  const clearTaste = useTasteStore((state) => state.clearTaste);

  const followedIdsKey = useMemo(
    () =>
      followedArtists
        .map((artist) => artist.artist_id)
        .sort((a, b) => a - b)
        .join(","),
    [followedArtists]
  );
  const [followedArtistEvents, setFollowedArtistEvents] = useState<{
    key: string;
    events: Event[];
  }>({ key: "", events: [] });

  useEffect(() => {
    if (!followedIdsKey) return;

    let cancelled = false;
    fetch(`/api/events/for-artists?ids=${followedIdsKey}`)
      .then((response) => (response.ok ? response.json() : { events: [] }))
      .then((data: { events?: Event[] }) => {
        if (!cancelled) {
          setFollowedArtistEvents({ key: followedIdsKey, events: data.events ?? [] });
        }
      })
      .catch((error) => console.error("Failed to load followed artist events", error));

    return () => {
      cancelled = true;
    };
  }, [followedIdsKey]);

  const candidateEvents = useMemo(() => {
    if (followedArtistEvents.key !== followedIdsKey) return events;

    const byId = new Map(events.map((event) => [event.event_id, event]));
    followedArtistEvents.events.forEach((event) => byId.set(event.event_id, event));
    return Array.from(byId.values());
  }, [events, followedArtistEvents, followedIdsKey]);

  const suggestedGenres = useMemo(() => {
    const counts = new Map<string, number>();
    artists.forEach((artist) => {
      artist.genres?.forEach((genre) => {
        counts.set(genre, (counts.get(genre) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 12)
      .map(([genre]) => genre);
  }, [artists]);

  const tasteGenres = useMemo(() => {
    if (preferredGenres.length > 0) return preferredGenres;
    const derived = new Set<string>();
    followedArtists.forEach((artist) => artist.genres?.forEach((genre) => derived.add(genre)));
    return Array.from(derived);
  }, [followedArtists, preferredGenres]);

  const recommendedEvents = useMemo(() => {
    const followedIds = new Set(followedArtists.map((artist) => artist.artist_id));
    const normalizedGenres = new Set(tasteGenres.map((genre) => genre.toLowerCase()));

    return [...candidateEvents]
      .map((event) => ({ event, score: scoreEvent(event, followedIds, normalizedGenres) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.event.event_date.localeCompare(b.event.event_date))
      .slice(0, 6)
      .map((entry) => entry.event);
  }, [candidateEvents, followedArtists, tasteGenres]);

  const hasTaste = followedArtists.length > 0 || preferredGenres.length > 0;

  return (
    <section className="page py-14">
      <SectionHead
        title="Your bill"
        note={
          hasTaste
            ? `${followedArtists.length} followed, ${savedEvents.length} saved. Shows matched to that.`
            : "Tell us what you like: a few genres, a few artists. Matching shows turn up here, on this device."
        }
        aside={
          hasTaste
            ? undefined
            : isSignedIn
              ? undefined
              : { href: "/auth/login", label: "Sign in to keep it" }
        }
      />

      {suggestedGenres.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          {suggestedGenres.map((genre) => {
            const active = preferredGenres.some(
              (entry) => entry.toLowerCase() === genre.toLowerCase()
            );
            return (
              <button
                key={genre}
                type="button"
                onClick={() => togglePreferredGenre(genre)}
                aria-pressed={active}
                className={cn(
                  "border-b pb-0.5 text-sm transition-colors",
                  active
                    ? "border-paper text-paper"
                    : "border-transparent text-smoke hover:border-line-strong hover:text-paper"
                )}
              >
                {genre}
              </button>
            );
          })}
          {(hasTaste || savedEvents.length > 0) && (
            <button
              type="button"
              onClick={clearTaste}
              className="meta ml-auto underline-offset-4 hover:text-paper hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {hasTaste && recommendedEvents.length > 0 && (
        <div className="mt-8">
          {recommendedEvents.map((event) => (
            <EventRow key={event.event_id} event={event} />
          ))}
          <div className="pt-4">
            <Link href="/events" className="meta-strong underline-offset-4 hover:underline">
              More shows
            </Link>
          </div>
        </div>
      )}

      {hasTaste && recommendedEvents.length === 0 && (
        <p className="mt-8 text-sm text-smoke">
          Nothing on the calendar matches yet. Follow a few more artists from the shows page, or admit you only like one DJ.
        </p>
      )}
    </section>
  );
}

function scoreEvent(
  event: Event,
  followedArtistIds: Set<number>,
  preferredGenres: Set<string>
) {
  let score = 0;

  event.artists?.forEach((artist) => {
    if (followedArtistIds.has(artist.artist_id)) score += 6;
    artist.genres?.forEach((genre) => {
      if (preferredGenres.has(genre.toLowerCase())) score += 2;
    });
  });

  if (event.festivalind) score += 1;
  if (event.electronicgenreind) score += 1;

  return score;
}
