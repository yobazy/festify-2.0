/**
 * Event dates are stored as calendar days ("2026-10-03"). `new Date("2026-10-03")`
 * parses that as UTC midnight, which renders as the previous day in US time zones
 * and differs between server and client. Always go through these helpers.
 */

// EDMtrain listings are US events; an event stays "upcoming" until its day ends here.
const EVENT_TIME_ZONE = "America/Los_Angeles";

export function parseEventDate(dateStr: string): Date {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  return new Date(dateStr);
}

export function formatEventDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
): string {
  return parseEventDate(dateStr).toLocaleDateString("en-US", options);
}

/** Today's calendar day as YYYY-MM-DD, for `.gte("event_date", ...)` filters. */
export function getTodayDateString(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Shift a YYYY-MM-DD calendar day by whole days (DST-safe, no time component). */
export function addDaysToDateString(dateStr: string, days: number): string {
  const date = parseEventDate(dateStr);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Last calendar day of the month containing `dateStr`, as YYYY-MM-DD. */
export function getEndOfMonthDateString(dateStr: string): string {
  const date = parseEventDate(dateStr);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return addDaysToDateString(dateStr, lastDay.getDate() - date.getDate());
}

/**
 * PostgREST `.or()` filter for events still running on `today`: multi-day
 * festivals stay listed until their last day, not just their first.
 */
export function upcomingEventsFilter(today = getTodayDateString()): string {
  return `event_date.gte.${today},event_end_date.gte.${today}`;
}

export function isEventUpcoming(
  event: { event_date: string; event_end_date?: string | null },
  today = getTodayDateString()
): boolean {
  // Matches upcomingEventsFilter: a bad end date (before the start) can't hide the event.
  const end = event.event_end_date;
  const lastDay = end && end > event.event_date ? end : event.event_date;
  return lastDay >= today;
}
