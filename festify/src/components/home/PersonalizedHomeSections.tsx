"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarHeart, Heart, Sparkles, Tags } from "lucide-react";
import { ArtistCard } from "@/components/artists/ArtistCard";
import { EventCard } from "@/components/events/EventCard";
import { useTasteStore } from "@/stores/tasteStore";
import { cn } from "@/lib/utils";
import type { Artist } from "@/types/artist";
import type { Event } from "@/types/event";

interface PersonalizedHomeSectionsProps {
  events: Event[];
  artists: Artist[];
  isSignedIn: boolean;
}

export function PersonalizedHomeSections({
  events,
  artists,
  isSignedIn,
}: PersonalizedHomeSectionsProps) {
  const followedArtists = useTasteStore((state) => state.followedArtists);
  const savedEvents = useTasteStore((state) => state.savedEvents);
  const preferredGenres = useTasteStore((state) => state.preferredGenres);
  const togglePreferredGenre = useTasteStore(
    (state) => state.togglePreferredGenre
  );
  const clearTaste = useTasteStore((state) => state.clearTaste);

  const suggestedGenres = useMemo(() => {
    const counts = new Map<string, number>();

    artists.forEach((artist) => {
      artist.genres?.forEach((genre) => {
        counts.set(genre, (counts.get(genre) ?? 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10)
      .map(([genre]) => genre);
  }, [artists]);

  const tasteGenres = useMemo(() => {
    if (preferredGenres.length > 0) return preferredGenres;

    const derivedGenres = new Set<string>();
    followedArtists.forEach((artist) => {
      artist.genres?.forEach((genre) => derivedGenres.add(genre));
    });

    return Array.from(derivedGenres);
  }, [followedArtists, preferredGenres]);

  const recommendedEvents = useMemo(() => {
    const followedIds = new Set(
      followedArtists.map((artist) => artist.artist_id)
    );
    const normalizedGenres = new Set(
      tasteGenres.map((genre) => genre.toLowerCase())
    );

    return [...events]
      .map((event) => ({
        event,
        score: scoreEvent(event, followedIds, normalizedGenres),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((entry) => entry.event);
  }, [events, followedArtists, tasteGenres]);

  const recommendedArtists = useMemo(() => {
    const followedIds = new Set(
      followedArtists.map((artist) => artist.artist_id)
    );
    const normalizedGenres = new Set(
      tasteGenres.map((genre) => genre.toLowerCase())
    );

    return [...artists]
      .filter((artist) => !followedIds.has(artist.artist_id))
      .map((artist) => ({
        artist,
        score: scoreArtist(artist, normalizedGenres),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((entry) => entry.artist);
  }, [artists, followedArtists, tasteGenres]);

  const hasTaste = followedArtists.length > 0 || preferredGenres.length > 0;

  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="glass rounded-3xl p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-white">
                <Sparkles size={18} className="text-primary" />
                <h2 className="font-brand text-2xl">
                  {isSignedIn ? "Your taste" : "Tune your feed"}
                </h2>
              </div>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {isSignedIn
                  ? "Follow artists, save events, and pick a few genres to shape what shows up first."
                  : "Pick a few genres, follow artists, or save events. It works right away on this device. Sign in if you want to keep it with your account."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {!isSignedIn && (
                <Link
                  href="/auth/login"
                  className="rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-white/15"
                >
                  Sign in to save it
                </Link>
              )}
              {(hasTaste || savedEvents.length > 0) && (
                <button
                  type="button"
                  onClick={clearTaste}
                  className="rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-white transition-all hover:border-white/20 hover:bg-white/5"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <TasteStat
              icon={<Heart size={16} className="text-primary" />}
              label="Following"
              value={followedArtists.length}
            />
            <TasteStat
              icon={<CalendarHeart size={16} className="text-primary" />}
              label="Saved events"
              value={savedEvents.length}
            />
            <TasteStat
              icon={<Tags size={16} className="text-primary" />}
              label="Preferred genres"
              value={preferredGenres.length}
            />
          </div>

          <div className="mt-5">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Pick a few genres
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedGenres.map((genre) => {
                const active = preferredGenres.some(
                  (entry) => entry.toLowerCase() === genre.toLowerCase()
                );

                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => togglePreferredGenre(genre)}
                    className={cn(
                      "rounded-full px-3 py-2 text-xs font-medium transition-all",
                      active
                        ? "bg-primary text-black"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {recommendedEvents.length > 0 && (
          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h3 className="font-brand text-3xl text-white">
                  {isSignedIn ? "For you" : "Picked for you"}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isSignedIn
                    ? "Events matched to what you've been following."
                    : "Events based on the artists and genres you picked here."}
                </p>
              </div>
              <Link
                href="/events"
                className="text-sm text-muted-foreground transition-colors hover:text-white"
              >
                See all events
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendedEvents.map((event, index) => (
                <EventCard key={event.event_id} event={event} index={index} />
              ))}
            </div>
          </section>
        )}

        {recommendedArtists.length > 0 && (
          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h3 className="font-brand text-3xl text-white">
                  Artists to dig into
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  A short list built from the genres you keep picking.
                </p>
              </div>
              <Link
                href="/artists"
                className="text-sm text-muted-foreground transition-colors hover:text-white"
              >
                Explore artists
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {recommendedArtists.map((artist, index) => (
                <ArtistCard
                  key={artist.artist_id}
                  artist={artist}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

function TasteStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 font-brand text-3xl text-white">{value}</div>
    </div>
  );
}

function scoreEvent(
  event: Event,
  followedArtistIds: Set<number>,
  preferredGenres: Set<string>
) {
  let score = 0;

  event.artists?.forEach((artist) => {
    if (followedArtistIds.has(artist.artist_id)) {
      score += 6;
    }

    artist.genres?.forEach((genre) => {
      if (preferredGenres.has(genre.toLowerCase())) {
        score += 2;
      }
    });
  });

  if (event.festivalind) score += 1;
  if (event.electronicgenreind) score += 1;

  return score;
}

function scoreArtist(artist: Artist, preferredGenres: Set<string>) {
  let score = artist.popularity ? artist.popularity / 25 : 0;

  artist.genres?.forEach((genre) => {
    if (preferredGenres.has(genre.toLowerCase())) {
      score += 3;
    }
  });

  if (artist.spotify_link) score += 1;

  return score;
}
