import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { EVENT_PLACEHOLDER_IMAGE } from "@/lib/constants";
import { formatEventDate } from "@/lib/dates";
import { getEventLocationLabel, normalizeEventImageUrl } from "@/lib/event-data";
import { lineupPreview } from "@/lib/lineup";
import { SaveEventButton } from "@/components/taste/SaveEventButton";
import type { Event } from "@/types/event";

interface EventRowProps {
  event: Event;
  /** Hide the date column when the list is already grouped by day. */
  showDate?: boolean;
  className?: string;
}

/**
 * One listing in the ledger: date | thumb | name + venue | lineup | save.
 * Rows sit on hairlines; the whole row is the link.
 */
export function EventRow({ event, showDate = true, className }: EventRowProps) {
  const image =
    normalizeEventImageUrl(event.use_alt ? event.alt_img : event.img_url) ??
    EVENT_PLACEHOLDER_IMAGE;
  const location = getEventLocationLabel(event) ?? "Venue TBA";
  const lineup = lineupPreview(event, 4);
  const spansDays =
    event.event_end_date && event.event_end_date > event.event_date;

  return (
    <div
      className={cn(
        "group relative grid items-center gap-x-4 gap-y-1 border-b border-line py-3",
        showDate
          ? "grid-cols-[3.5rem_3rem_minmax(0,1fr)_auto] md:grid-cols-[4.5rem_3.5rem_minmax(0,1.4fr)_minmax(0,1fr)_auto]"
          : "grid-cols-[3rem_minmax(0,1fr)_auto] md:grid-cols-[3.5rem_minmax(0,1.4fr)_minmax(0,1fr)_auto]",
        "transition-colors hover:bg-ink-2",
        className
      )}
    >
      <Link
        href={`/events/${event.event_id}`}
        className="absolute inset-0 z-0"
        aria-label={event.event_name}
      />

      {showDate && (
        <div className="meta-strong z-10 pointer-events-none leading-tight">
          <span className="block">
            {formatEventDate(event.event_date, { weekday: "short" })}
          </span>
          <span className="block text-smoke">
            {formatEventDate(event.event_date, { day: "2-digit", month: "short" })}
          </span>
          {spansDays && (
            <span className="block text-smoke">
              –{formatEventDate(event.event_end_date!, { day: "2-digit" })}
            </span>
          )}
        </div>
      )}

      <div className="relative z-10 pointer-events-none h-12 w-12 overflow-hidden bg-ink-3 md:h-14 md:w-14">
        <Image
          src={image}
          alt=""
          fill
          sizes="56px"
          className="img-poster object-cover"
        />
      </div>

      <div className="z-10 pointer-events-none min-w-0">
        <h3 className="display-narrow truncate text-lg text-paper group-hover:text-signal transition-colors sm:text-xl">
          {event.event_name}
        </h3>
        <p className="meta mt-1 truncate">{location}</p>
        {lineup && (
          <p className="mt-1 truncate text-sm text-paper-2 md:hidden">{lineup}</p>
        )}
      </div>

      <div className="z-10 pointer-events-none hidden min-w-0 md:block">
        {lineup ? (
          <p className="truncate text-sm text-paper-2">{lineup}</p>
        ) : !event.artists?.length ? (
          <p className="text-sm text-smoke">Lineup TBA</p>
        ) : null}
      </div>

      <div className="relative z-10 flex items-center justify-end gap-2">
        {event.festivalind && (
          <span className="meta hidden lg:inline">Festival</span>
        )}
        <SaveEventButton event={event} compact />
      </div>
    </div>
  );
}
