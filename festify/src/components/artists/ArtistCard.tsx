"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { Artist } from "@/types/artist";

interface ArtistCardProps {
  artist: Artist;
  index?: number;
}

export function ArtistCard({ artist, index = 0 }: ArtistCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/artists/${artist.artist_id}`}>
        <div
          className={cn(
            "group relative glass glass-hover p-5",
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
          <h3 className="font-brand text-base text-white mb-2 group-hover:text-primary transition-colors">
            {artist.artist_name}
          </h3>

          {/* Genres */}
          {artist.genres && artist.genres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mb-3">
              {artist.genres.slice(0, 3).map((genre) => (
                <Badge key={genre} variant="muted" className="text-[10px]">
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          {/* Popularity */}
          {artist.popularity !== null && (
            <div className="w-full max-w-[120px]">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Popularity</span>
                <span>{artist.popularity}</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full gradient-purple rounded-full transition-all duration-500"
                  style={{ width: `${artist.popularity}%` }}
                />
              </div>
            </div>
          )}

          {/* Spotify link indicator */}
          {artist.spotify_link && (
            <ExternalLink
              size={14}
              className="absolute top-4 right-4 text-muted-foreground group-hover:text-green-500 transition-colors"
            />
          )}
        </div>
      </Link>
    </motion.div>
  );
}
