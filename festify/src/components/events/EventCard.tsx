import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { EVENT_PLACEHOLDER_IMAGE } from "@/lib/constants";
import { formatEventDate } from "@/lib/dates";
import { getEventLocationLabel, normalizeEventImageUrl } from "@/lib/event-data";
import { artistsNotNamedIn, rankLineup } from "@/lib/lineup";
import { SaveEventButton } from "@/components/taste/SaveEventButton";
import type { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
  /** Larger type for two-up grids. */
  size?: "md" | "lg";
  className?: string;
  priority?: boolean;
}

/** Poster tile: 3:4 image, name and top of the bill set at the foot. */
export function EventCard({ event, size = "md", className, priority }: EventCardProps) {
  const image =
    normalizeEventImageUrl(event.use_alt ? event.alt_img : event.img_url) ??
    EVENT_PLACEHOLDER_IMAGE;
  const location = getEventLocationLabel(event) ?? "Venue TBA";
  const bill = artistsNotNamedIn(rankLineup(event.artists), event.event_name).slice(0, 3);
  const spansDays = event.event_end_date && event.event_end_date > event.event_date;

  return (
    <article className={cn("group relative aspect-[3/4] overflow-hidden bg-ink-2", className)}>
      <Image
        src={image}
        alt=""
        fill
        priority={priority}
        sizes={size === "lg" ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
        className="img-poster object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <div className="scrim-bottom absolute inset-0" />

      <Link
        href={`/events/${event.event_id}`}
        className="absolute inset-0 z-10"
        aria-label={event.event_name}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4">
        <p className="meta-strong leading-tight">
          {formatEventDate(event.event_date, { weekday: "short", day: "2-digit", month: "short" })}
          {spansDays && (
            <span className="block text-smoke">
              to {formatEventDate(event.event_end_date!, { day: "2-digit", month: "short" })}
            </span>
          )}
        </p>
        <div className="pointer-events-auto">
          <SaveEventButton event={event} compact className="bg-ink/60 backdrop-blur-[2px]" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-4 sm:p-5">
        <h3
          className={cn(
            "display text-paper transition-colors group-hover:text-signal",
            size === "lg" ? "text-3xl sm:text-4xl lg:text-5xl" : "text-2xl sm:text-3xl"
          )}
        >
          {event.event_name}
        </h3>
        {bill.length > 0 && (
          <p className="billing-line mt-3 flex flex-wrap text-sm text-paper-2">
            {bill.map((artist) => (
              <span key={artist.artist_id}>{artist.artist_name}</span>
            ))}
          </p>
        )}
        <p className="meta mt-2 truncate">{location}</p>
      </div>
    </article>
  );
}
