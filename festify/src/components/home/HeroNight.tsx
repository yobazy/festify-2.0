import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatEventDate } from "@/lib/dates";
import { getEventLocationLabel, normalizeEventImageUrl } from "@/lib/event-data";
import { artistsNotNamedIn } from "@/lib/lineup";
import { Billing } from "@/components/events/Billing";
import { PlayLineupLink } from "@/components/events/PlayLineupLink";
import { SaveEventButton } from "@/components/taste/SaveEventButton";
import type { Event } from "@/types/event";

interface HeroNightProps {
  event: Event;
  /** Why this one leads: "Strongest bill this week" etc. */
  reason: string;
}

/**
 * The front page lead: one night, set like its own poster. With a photo it's
 * a full-bleed still; without one it's the type-only flyer.
 */
export function HeroNight({ event, reason }: HeroNightProps) {
  const image = normalizeEventImageUrl(event.use_alt ? event.alt_img : event.img_url);
  const location = getEventLocationLabel(event);
  const spansDays = event.event_end_date && event.event_end_date > event.event_date;
  const bill = artistsNotNamedIn(event.artists, event.event_name);

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-line",
        image ? "min-h-[82svh] bg-ink-2" : "bg-ink"
      )}
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
          <div className="scrim-left absolute inset-0 hidden md:block" />
          <div className="scrim-bottom absolute inset-0" />
        </>
      )}

      <div
        className={cn(
          "page relative flex flex-col justify-end",
          image ? "min-h-[82svh] pb-10 pt-24 sm:pb-14" : "pb-12 pt-14 sm:pb-16 sm:pt-20"
        )}
      >
        <p className="meta-strong mb-6 flex flex-wrap gap-x-6 gap-y-1">
          <span className="text-signal">{reason}</span>
          <span>
            {formatEventDate(event.event_date, {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
            {spansDays &&
              ` to ${formatEventDate(event.event_end_date!, { day: "2-digit", month: "long" })}`}
          </span>
          {location && <span>{location}</span>}
        </p>

        <h1
          className={cn(
            "display max-w-[14ch] text-paper",
            image ? "text-[clamp(2.75rem,9vw,8.5rem)]" : "text-[clamp(3rem,11vw,10.5rem)]"
          )}
        >
          <Link href={`/events/${event.event_id}`} className="transition-colors hover:text-signal">
            {event.event_name}
          </Link>
        </h1>

        {bill.length > 0 && (
          <div className="mt-8 max-w-4xl">
            <Billing artists={bill} variant="hero" maxRest={0} />
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <PlayLineupLink eventId={event.event_id} />
          <SaveEventButton event={event} />
          <Link
            href={`/events/${event.event_id}`}
            className="text-sm font-medium text-paper-2 underline-offset-4 hover:text-paper hover:underline"
          >
            Full bill and set times
          </Link>
        </div>
      </div>
    </section>
  );
}
