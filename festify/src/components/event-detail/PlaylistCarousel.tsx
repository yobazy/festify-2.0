"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Music, ExternalLink } from "lucide-react";
import { useSpotifyToken } from "@/hooks/useSpotifyToken";
import { searchPlaylists } from "@/lib/spotify";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { SpotifyEmbed } from "./SpotifyEmbed";
import type { SpotifyPlaylist } from "@/types/playlist";

interface PlaylistCarouselProps {
  eventName: string;
}

export function PlaylistCarousel({ eventName }: PlaylistCarouselProps) {
  const { token } = useSpotifyToken();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    searchPlaylists(eventName, token)
      .then((results) => setPlaylists(results))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, eventName]);

  if (loading) {
    return (
      <section className="py-12">
        <h2 className="font-brand text-2xl text-white mb-6 flex items-center gap-2">
          <Music size={24} className="text-green-500" />
          Spotify Playlists
        </h2>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-48 h-48 rounded-xl shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (playlists.length === 0) return null;

  return (
    <section className="py-12">
      <h2 className="font-brand text-2xl text-white mb-6 flex items-center gap-2">
        <Music size={24} className="text-green-500" />
        Spotify Playlists
      </h2>

      {/* Carousel */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {playlists.map((playlist, i) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="shrink-0 snap-start"
            >
              <button
                onClick={() =>
                  setActivePlaylist(
                    activePlaylist === playlist.id ? null : playlist.id
                  )
                }
                className={cn(
                  "group relative w-44 rounded-xl overflow-hidden",
                  "border-2 transition-all duration-300",
                  activePlaylist === playlist.id
                    ? "border-green-500 shadow-lg shadow-green-500/20"
                    : "border-transparent hover:border-white/20"
                )}
              >
                <div className="relative aspect-square">
                  {playlist.images?.[0]?.url ? (
                    <Image
                      src={playlist.images[0].url}
                      alt={playlist.name}
                      fill
                      sizes="176px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <Music size={40} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs font-medium text-white line-clamp-2 text-left">
                    {playlist.name}
                  </p>
                </div>
              </button>

              {/* External link */}
              <a
                href={playlist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground hover:text-green-500 transition-colors"
              >
                <ExternalLink size={10} />
                Open in Spotify
              </a>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Embed Player */}
      {activePlaylist && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-6"
        >
          <SpotifyEmbed playlistId={activePlaylist} />
        </motion.div>
      )}
    </section>
  );
}
