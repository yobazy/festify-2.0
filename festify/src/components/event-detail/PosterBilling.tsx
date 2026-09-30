"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { billingTiers, rankLineup } from "@/lib/lineup";
import { tierClasses } from "@/components/events/Billing";
import type { Artist } from "@/types/artist";

interface PosterBillingProps {
  artists: Artist[];
  /** Cap for the smallest tier; the remainder becomes "+N more". */
  maxRest?: number;
  className?: string;
}

const classes = tierClasses.poster;

/**
 * The event page's poster billing, centred, with the one orchestrated moment
 * on the page: each tier line rises into place on load.
 */
export function PosterBilling({ artists, maxRest = 24, className }: PosterBillingProps) {
  const reduceMotion = useReducedMotion();
  const ranked = rankLineup(artists);
  if (ranked.length === 0) return null;

  const tiers = billingTiers(ranked);
  const rest = tiers.rest.slice(0, maxRest);
  const overflow = tiers.rest.length - rest.length;

  type Line = { key: keyof typeof classes; artists: Artist[] };
  const lines = (
    [
      { key: "headliners", artists: tiers.headliners },
      { key: "support", artists: tiers.support },
      { key: "undercard", artists: tiers.undercard },
      { key: "rest", artists: rest },
    ] satisfies Line[]
  ).filter((line) => line.artists.length > 0);

  return (
    <div className={cn("flex flex-col items-center gap-3 text-center sm:gap-4", className)}>
      {lines.map(({ key, artists: names }, index) => (
        <motion.p
          key={key}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: index * 0.08 }}
          className={cn(
            "billing-line flex flex-wrap items-baseline justify-center gap-y-1",
            classes[key]
          )}
        >
          {names.map((artist) => (
            <Link
              key={artist.artist_id}
              href={`/artists/${artist.artist_id}`}
              className="transition-colors hover:text-signal"
            >
              {artist.artist_name}
            </Link>
          ))}
          {key === "rest" && overflow > 0 && (
            <span className="text-smoke">+{overflow} more</span>
          )}
        </motion.p>
      ))}
    </div>
  );
}
