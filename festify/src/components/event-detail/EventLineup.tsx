"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Artist } from "@/types/artist";

interface EventLineupProps {
  artists: Artist[];
}

export function EventLineup({ artists }: EventLineupProps) {
  if (artists.length === 0) return null;

  return (
    <section className="py-12">
      <h2 className="font-brand text-2xl text-white mb-6 uppercase tracking-wider">
        Lineup
      </h2>

      <div className="flex flex-wrap gap-3">
        {artists.map((artist, i) => (
          <motion.div
            key={artist.artist_id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
          >
            <Link href={`/artists/${artist.artist_id}`}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-full",
                  "glass glass-hover",
                  "group cursor-pointer"
                )}
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={artist.img_url || PLACEHOLDER_IMAGE}
                    alt={artist.artist_name}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                  {artist.artist_name}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
