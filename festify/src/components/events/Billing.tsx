import Link from "next/link";
import { cn } from "@/lib/utils";
import { billingTiers, rankLineup } from "@/lib/lineup";
import type { Artist } from "@/types/artist";

interface BillingProps {
  artists: Artist[] | null | undefined;
  /**
   * hero: home hero, three tiers, names link.
   * poster: event page, four tiers, names link.
   * inline: listings preview, one small line, no links.
   */
  variant?: "hero" | "poster" | "inline";
  /** Cap for the smallest tier; the remainder becomes "+N more". */
  maxRest?: number;
  align?: "left" | "center";
  className?: string;
}

export const tierClasses = {
  hero: {
    headliners: "display text-3xl sm:text-5xl lg:text-6xl",
    support: "display-narrow text-lg sm:text-2xl lg:text-3xl text-paper",
    undercard: "font-display font-semibold uppercase text-xs sm:text-sm tracking-wide text-paper-2",
    rest: "meta",
  },
  poster: {
    headliners: "display text-4xl sm:text-6xl lg:text-7xl",
    support: "display-narrow text-2xl sm:text-3xl lg:text-4xl text-paper",
    undercard: "font-display font-semibold uppercase text-sm sm:text-base tracking-wide text-paper-2",
    rest: "font-display uppercase text-xs sm:text-sm tracking-wide text-smoke",
  },
  inline: {
    headliners: "text-sm text-paper",
    support: "text-sm text-paper-2",
    undercard: "text-sm text-smoke",
    rest: "text-sm text-smoke",
  },
} as const;

/** A lineup typeset like a poster: headliners biggest, the bill shrinking below. */
export function Billing({
  artists,
  variant = "poster",
  maxRest = 24,
  align = "left",
  className,
}: BillingProps) {
  const ranked = rankLineup(artists);
  if (ranked.length === 0) return null;

  const tiers = billingTiers(ranked);
  const classes = tierClasses[variant];
  const linkNames = variant !== "inline";

  const rest = tiers.rest.slice(0, maxRest);
  const overflow = tiers.rest.length - rest.length;

  const lines: Array<{ key: keyof typeof classes; artists: Artist[] }> = [
    { key: "headliners", artists: tiers.headliners },
    { key: "support", artists: tiers.support },
    { key: "undercard", artists: tiers.undercard },
    { key: "rest", artists: rest },
  ];

  return (
    <div
      className={cn(
        "flex flex-col",
        variant === "inline" ? "gap-0.5" : "gap-3 sm:gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {lines.map(({ key, artists: names }) =>
        names.length === 0 ? null : (
          <p
            key={key}
            className={cn(
              "billing-line flex flex-wrap items-baseline",
              align === "center" ? "justify-center" : "justify-start",
              variant === "inline" ? "gap-x-0" : "gap-y-1",
              classes[key]
            )}
          >
            {names.map((artist) =>
              linkNames ? (
                <Link
                  key={artist.artist_id}
                  href={`/artists/${artist.artist_id}`}
                  className="transition-colors hover:text-signal"
                >
                  {artist.artist_name}
                </Link>
              ) : (
                <span key={artist.artist_id}>{artist.artist_name}</span>
              )
            )}
            {key === "rest" && overflow > 0 && (
              <span className="text-smoke">+{overflow} more</span>
            )}
          </p>
        )
      )}
    </div>
  );
}
