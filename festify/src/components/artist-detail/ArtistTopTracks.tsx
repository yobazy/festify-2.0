"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ExternalLink, Music2, Pause, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useSpotifyToken } from "@/hooks/useSpotifyToken";
import { getArtistTopTracks, searchArtist } from "@/lib/spotify";
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

export function ArtistTopTracks({ artist }: ArtistTopTracksProps) {
  const { token, error } = useSpotifyToken();
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
      if (!token) return;

      try {
        let artistId = spotifyArtistId;

        if (!artistId) {
          const spotifyArtist = await searchArtist(artist.artist_name, token);
          artistId = spotifyArtist?.id ?? null;
        }

        if (!artistId) {
          if (!cancelled) setTracks([]);
          return;
        }

        const topTracks = await getArtistTopTracks(artistId, token);

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
  }, [artist.artist_name, spotifyArtistId, token]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (error) return null;

  if (loading) {
    return (
      <section className="py-10">
        <div className="mb-6 flex items-center gap-2">
          <Music2 size={22} className="text-primary" />
          <h2 className="font-brand text-2xl text-white">Top Tracks</h2>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (tracks.length === 0) return null;

  return (
    <section className="py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Music2 size={22} className="text-primary" />
            <h2 className="font-brand text-2xl text-white">Top Tracks</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Quick taste check before you commit to a set.
          </p>
        </div>
        <Badge variant="muted">Spotify</Badge>
      </div>

      <div className="space-y-3">
        {tracks.map((track, index) => {
          const isPlaying = activePreview === track.id;

          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn(
                "glass flex items-center gap-4 rounded-2xl p-4",
                "border border-white/5"
              )}
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={track.album?.images?.[0]?.url || PLACEHOLDER_IMAGE}
                  alt={track.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {track.name}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {track.album?.name || artist.artist_name}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {track.preview_url ? (
                  <button
                    type="button"
                    onClick={() => togglePreview(track, isPlaying)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors",
                      isPlaying
                        ? "bg-primary text-black"
                        : "bg-white/10 text-white hover:bg-white/15"
                    )}
                  >
                    {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                    {isPlaying ? "Pause" : "Preview"}
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No preview
                  </span>
                )}

                {track.external_urls?.spotify && (
                  <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-green-500"
                  >
                    <ExternalLink size={12} />
                    Spotify
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
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
