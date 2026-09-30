"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { SectionHead } from "@/components/ui/SectionHead";
import { getArtistTopTracks } from "@/lib/spotify";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Artist } from "@/types/artist";

interface ArtistTopTracksProps {
  artist: Artist;
}

interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string | null;
  duration_ms: number;
  external_urls?: {
    spotify?: string;
  };
  album?: {
    name?: string;
    images?: Array<{ url: string }>;
  };
}

const rowClass =
  "grid grid-cols-[2.5rem_3rem_minmax(0,1fr)_auto] items-center gap-x-4 border-b border-line py-3";

/** Five from Spotify, numbered like a tracklist, with 30-second previews. */
export function ArtistTopTracks({ artist }: ArtistTopTracksProps) {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const spotifyArtistId = useMemo(
    () => extractSpotifyArtistId(artist.spotify_link),
    [artist.spotify_link]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadTracks() {
      try {
        const topTracks = await getArtistTopTracks<SpotifyTrack>({
          spotifyArtistId,
          artistName: artist.artist_name,
        });

        if (!cancelled) {
          setTracks(topTracks.slice(0, 5));
        }
      } catch (loadError) {
        console.error("Failed to load artist top tracks", loadError);
        if (!cancelled) setTracks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTracks();

    return () => {
      cancelled = true;
    };
  }, [artist.artist_name, spotifyArtistId]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <section className="py-14">
        <SectionHead
          title="Top tracks"
          note="Five from Spotify. Press play for a 30-second preview."
        />
        <ol className="mt-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className={rowClass}>
              <Skeleton className="h-3 w-6" />
              <Skeleton className="h-12 w-12" />
              <div>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-2 h-3 w-1/3" />
              </div>
              <Skeleton className="h-10 w-10" />
            </li>
          ))}
        </ol>
      </section>
    );
  }

  if (tracks.length === 0) return null;

  return (
    <section className="py-14">
      <SectionHead
        title="Top tracks"
        note="Five from Spotify. Press play for a 30-second preview."
      />

      <ol className="mt-6">
        {tracks.map((track, index) => {
          const isPlaying = activePreview === track.id;

          return (
            <li key={track.id} className={rowClass}>
              <span className="meta">{String(index + 1).padStart(2, "0")}</span>

              <div className="relative h-12 w-12 overflow-hidden bg-ink-3">
                <Image
                  src={track.album?.images?.[0]?.url || PLACEHOLDER_IMAGE}
                  alt=""
                  fill
                  sizes="48px"
                  className="img-poster object-cover"
                />
              </div>

              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm text-paper">
                  <span className="truncate">{track.name}</span>
                  {isPlaying && (
                    <span className="live-bars shrink-0" aria-label="Playing">
                      <span />
                      <span />
                      <span />
                    </span>
                  )}
                </p>
                <p className="meta mt-1 truncate">{track.album?.name || artist.artist_name}</p>
              </div>

              <div className="flex items-center gap-4">
                {track.external_urls?.spotify && (
                  <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="meta-strong hidden underline-offset-4 hover:underline sm:inline"
                  >
                    Spotify
                  </a>
                )}

                {track.preview_url ? (
                  <button
                    type="button"
                    onClick={() => togglePreview(track, isPlaying)}
                    aria-pressed={isPlaying}
                    aria-label={isPlaying ? `Pause ${track.name}` : `Play ${track.name} preview`}
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center transition-[background-color,color,border-color,transform] active:scale-95",
                      isPlaying
                        ? "bg-signal text-signal-ink"
                        : "border border-line-strong text-paper hover:border-paper hover:bg-ink-2"
                    )}
                  >
                    {isPlaying ? (
                      <Pause size={14} className="fill-current" />
                    ) : (
                      <Play size={14} className="fill-current" />
                    )}
                  </button>
                ) : (
                  <span className="meta">No preview</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );

  function togglePreview(track: SpotifyTrack, isPlaying: boolean) {
    if (!track.preview_url) return;

    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setActivePreview(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(track.preview_url);
    audioRef.current = audio;
    audio.onended = () => {
      setActivePreview(null);
      audioRef.current = null;
    };

    audio
      .play()
      .then(() => setActivePreview(track.id))
      .catch((playError) => {
        console.error("Failed to play preview", playError);
        setActivePreview(null);
      });
  }
}

function extractSpotifyArtistId(spotifyLink: string | null): string | null {
  if (!spotifyLink) return null;

  const match = spotifyLink.match(/artist\/([a-zA-Z0-9]+)/);
  return match?.[1] ?? null;
}
