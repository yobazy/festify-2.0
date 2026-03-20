"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FollowArtistButton } from "@/components/taste/FollowArtistButton";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { Artist } from "@/types/artist";

interface ArtistHeroProps {
  artist: Artist;
}

export function ArtistHero({ artist }: ArtistHeroProps) {
  return (
    <section className="relative pt-16 pb-12 overflow-hidden">
      {/* Blurred Background */}
      {artist.img_url && (
        <>
          <Image
            src={artist.img_url}
            alt=""
            fill
            className="object-cover blur-3xl opacity-20 scale-110"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </>
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-16 flex flex-col items-center text-center">
        {/* Artist Photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden ring-4 ring-primary/30 mb-6"
        >
          <Image
            src={artist.img_url || PLACEHOLDER_IMAGE}
            alt={artist.artist_name}
            fill
            priority
            sizes="224px"
            className="object-cover"
          />
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="font-brand text-4xl sm:text-5xl text-white mb-4"
        >
          {artist.artist_name}
        </motion.h1>

        {/* Genres */}
        {artist.genres && artist.genres.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap justify-center gap-2 mb-6"
          >
            {artist.genres.map((genre) => (
              <Badge key={genre} variant="default">
                {genre}
              </Badge>
            ))}
          </motion.div>
        )}

        {/* Popularity + Spotify Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
        >
          <FollowArtistButton artist={artist} className="bg-white/10 hover:bg-white/15" />

          {artist.popularity !== null && (
            <div className="text-center">
              <div className="text-2xl font-brand text-white">
                {artist.popularity}
              </div>
              <div className="text-xs text-muted-foreground">Popularity</div>
            </div>
          )}

          {artist.spotify_link && (
            <a
              href={artist.spotify_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
            >
              <ExternalLink size={14} />
              Open in Spotify
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}
