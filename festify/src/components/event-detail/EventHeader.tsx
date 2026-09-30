import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatEventDate } from "@/lib/dates";
import { normalizeEventImageUrl } from "@/lib/event-data";
import { PlayLineupLink } from "@/components/events/PlayLineupLink";
import { SaveEventButton } from "@/components/taste/SaveEventButton";
import type { Event } from "@/types/event";

interface EventHeaderProps {
  event: Event;
}

/**
 * The top of the poster: the facts in mono, the name set huge. With a photo
 * it's a full-bleed still; without one it's the type-only flyer.
 */
export function EventHeader({ event }: EventHeaderProps) {
  const image = normalizeEventImageUrl(event.use_alt ? event.alt_img : event.img_url);
  const venue = event.event_venue?.trim() || null;
  const city = event.event_location?.trim() || null;
  const spansDays = event.event_end_date && event.event_end_date > event.event_date;

  return (
    <section
      className={cn("relative overflow-hidden", image ? "min-h-[70svh] bg-ink-2" : "bg-ink")}
    >
      {image && (
        <>
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="img-poster object-cover"
          />
          <div className="scrim-bottom absolute inset-0" />
        </>
      )}

      <div
        className={cn(
          "page relative flex flex-col justify-end",
          image ? "min-h-[70svh] pb-10 pt-24 sm:pb-14" : "pb-12 pt-14 sm:pb-16 sm:pt-20"
        )}
      >
        <p className="meta-strong mb-6 flex flex-wrap gap-x-6 gap-y-1">
          <span>
            {formatEventDate(event.event_date, {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
            {spansDays &&
              ` to ${formatEventDate(event.event_end_date!, { day: "2-digit", month: "long" })}`}
          </span>
          {venue && <span>{venue}</span>}
          {city && <span>{city}</span>}
          {event.festivalind && <span>Festival</span>}
        </p>

        <h1
          className={cn(
            "display max-w-[14ch] text-paper",
            image ? "text-[clamp(2.5rem,8vw,7.5rem)]" : "text-[clamp(3rem,11vw,10.5rem)]"
          )}
        >
          {event.event_name}
        </h1>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <PlayLineupLink eventId={event.event_id} label="Hear the lineup" />
          <SaveEventButton event={event} />
          {event.edmtrain_link && (
            <a
              href={event.edmtrain_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-paper-2 underline-offset-4 hover:text-paper hover:underline"
            >
              Tickets and info
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
