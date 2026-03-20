"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { FollowArtistButton } from "@/components/taste/FollowArtistButton";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { Artist } from "@/types/artist";

interface ArtistCardProps {
  artist: Artist;
  index?: number;
}

export function ArtistCard({ artist, index = 0 }: ArtistCardProps) {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div className="relative h-full">
        <div className="absolute left-3 top-3 z-10">
          <FollowArtistButton artist={artist} />
        </div>

        <Link href={`/artists/${artist.artist_id}`} className="block h-full">
        <div
          className={cn(
            "group relative h-[320px] glass glass-hover p-5",
            "flex flex-col items-center text-center",
            "hover:shadow-lg hover:shadow-primary/10"
          )}
        >
          {/* Artist Image */}
          <div className="relative w-28 h-28 rounded-full overflow-hidden mb-4 ring-2 ring-white/10 group-hover:ring-primary/50 transition-all duration-300">
            <Image
              src={artist.img_url || PLACEHOLDER_IMAGE}
              alt={artist.artist_name}
              fill
              sizes="112px"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          {/* Name */}
          <h3 className="mb-2 min-h-[3rem] text-base font-brand text-white transition-colors group-hover:text-primary flex items-center justify-center">
            {artist.artist_name}
          </h3>

          {/* Genres */}
          <div className="mb-3 min-h-[3.5rem]">
            {artist.genres && artist.genres.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5">
                {artist.genres.slice(0, 3).map((genre) => (
                  <Badge key={genre} variant="muted" className="text-[10px]">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Popularity */}
          <div className="mt-auto flex min-h-[1.75rem] w-full max-w-[120px] flex-col justify-end">
            {artist.popularity !== null && (
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Popularity</span>
                <span>{artist.popularity}</span>
              </div>
            )}
            <div className="h-1 overflow-hidden rounded-full bg-white/5">
              {artist.popularity !== null && (
                <div
                  className="h-full rounded-full gradient-purple transition-all duration-500"
                  style={{ width: `${artist.popularity}%` }}
                />
              )}
            </div>
          </div>

          {/* Spotify link indicator */}
          {artist.spotify_link && (
            <ExternalLink
              size={14}
              className="absolute top-4 right-4 text-muted-foreground group-hover:text-green-500 transition-colors"
            />
          )}
        </div>
        </Link>
      </div>
    </motion.div>
  );
}
