"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Artist } from "@/types/artist";

interface EventLineupProps {
  artists: Artist[];
}

export function EventLineup({ artists }: EventLineupProps) {
  if (artists.length === 0) return null;

  const hasPopularityData = artists.some((artist) => artist.popularity !== null);
  const featuredArtists = artists.slice(0, 6);
  const remainingArtists = artists.slice(6);
  const hasFeaturedSection = hasPopularityData && artists.length > 8;

  return (
    <section className="py-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-brand text-2xl text-white uppercase tracking-wider">
            Lineup
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasPopularityData
              ? "Sorted by popularity so the biggest names surface first."
              : "Explore the full lineup and jump straight into any artist page."}
          </p>
        </div>
        <Badge variant="muted">{artists.length} artists</Badge>
      </div>

      {hasFeaturedSection ? (
        <div className="space-y-8">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">
                Top Picks
              </h3>
              <Badge variant="accent">Start here</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              {featuredArtists.map((artist, i) => (
                <ArtistPill
                  key={artist.artist_id}
                  artist={artist}
                  index={i}
                  featured
                />
              ))}
            </div>
          </div>

          {remainingArtists.length > 0 && (
            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-white/80">
                Full Lineup
              </h3>
              <div className="flex flex-wrap gap-3">
                {remainingArtists.map((artist, i) => (
                  <ArtistPill
                    key={artist.artist_id}
                    artist={artist}
                    index={i + featuredArtists.length}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {artists.map((artist, i) => (
            <ArtistPill key={artist.artist_id} artist={artist} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

interface ArtistPillProps {
  artist: Artist;
  index: number;
  featured?: boolean;
}

function ArtistPill({ artist, index, featured = false }: ArtistPillProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <Link href={`/artists/${artist.artist_id}`}>
        <div
          className={cn(
            "flex items-center gap-3 rounded-full px-4 py-2.5",
            "glass glass-hover group cursor-pointer",
            featured && "ring-1 ring-primary/30 bg-primary/10"
          )}
        >
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
            <Image
              src={artist.img_url || PLACEHOLDER_IMAGE}
              alt={artist.artist_name}
              fill
              sizes="32px"
              className="object-cover"
            />
          </div>
          <span className="text-sm font-medium text-white transition-colors group-hover:text-primary">
            {artist.artist_name}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
