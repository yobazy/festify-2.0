"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { searchPlaylists } from "@/lib/spotify";
import { cn } from "@/lib/utils";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { SectionHead } from "@/components/ui/SectionHead";
import { Skeleton } from "@/components/ui/Skeleton";
import { SpotifyEmbed } from "./SpotifyEmbed";
import type { SpotifyPlaylist } from "@/types/playlist";

interface PlaylistCarouselProps {
  eventName: string;
}

/**
 * The "Listen" section: playlists Spotify has for this bill, first one
 * loaded into the player so the hero's play button lands on something ready.
 */
export function PlaylistCarousel({ eventName }: PlaylistCarouselProps) {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // The page keys this component by event id, so a new event remounts it with fresh state.
  useEffect(() => {
    let cancelled = false;

    searchPlaylists(eventName)
      .then((results) => {
        if (cancelled) return;
        setPlaylists(results);
        setActiveId(results[0]?.id ?? null);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventName]);

  const active = playlists.find((playlist) => playlist.id === activeId) ?? null;

  return (
    <section id="listen" className="page scroll-mt-14 py-14">
      <SectionHead title="Listen" note="Playlists built around this bill, from Spotify." />

      {loading ? (
        <div className="scrollbar-hide mt-8 tile-strip overflow-x-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-36 shrink-0 bg-ink sm:w-40">
              <Skeleton className="aspect-square w-full" />
              <div className="p-3 pb-4">
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <p className="mt-8 text-sm text-smoke">
          {failed
            ? "Couldn't reach Spotify. Reload to try again."
            : "No playlist matched this bill yet. Try the artists below."}
        </p>
      ) : (
        <>
          <div
            className="scrollbar-hide mt-8 tile-strip snap-x snap-mandatory overflow-x-auto"
            role="listbox"
            aria-label="Playlists"
          >
            {playlists.map((playlist) => {
              const isActive = playlist.id === activeId;
              return (
                <button
                  key={playlist.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => setActiveId(playlist.id)}
                  className="group w-36 shrink-0 snap-start bg-ink text-left sm:w-40"
                >
                  <div className="relative aspect-square overflow-hidden bg-ink-3">
                    <Image
                      src={playlist.images?.[0]?.url || PLACEHOLDER_IMAGE}
                      alt=""
                      fill
                      sizes="160px"
                      className={cn(
                        "img-poster object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
                        !isActive && "opacity-80"
                      )}
                    />
                    {isActive && (
                      <span className="absolute bottom-3 left-3 flex h-6 w-6 items-end justify-center bg-ink/70 p-1.5">
                        <span className="live-bars" aria-hidden="true">
                          <span />
                          <span />
                          <span />
                        </span>
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "line-clamp-2 p-3 pb-4 text-sm transition-colors",
                      isActive ? "text-paper" : "text-smoke group-hover:text-paper"
                    )}
                  >
                    {playlist.name}
                  </p>
                </button>
              );
            })}
          </div>

          {active && (
            <div className="mt-8">
              <SpotifyEmbed playlistId={active.id} />
              <p className="meta mt-3 flex flex-wrap gap-x-6 gap-y-1">
                <span className="text-paper">{active.name}</span>
                {active.owner?.display_name && <span>{active.owner.display_name}</span>}
                <span>
                  {active.tracks.total} {active.tracks.total === 1 ? "track" : "tracks"}
                </span>
                <a
                  href={active.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="meta-strong underline-offset-4 hover:underline"
                >
                  Open in Spotify
                </a>
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
