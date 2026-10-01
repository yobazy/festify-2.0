"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EventRow } from "./EventRow";
import {
  EventFilters,
  type DatePreset,
  type EventSort,
  type EventViewMode,
} from "./EventFilters";
import { useDebounce } from "@/hooks/useDebounce";
import { hasEventLocation } from "@/lib/event-data";
import { buildPlaces, findPlaceForLocation } from "@/lib/places";
import { Button } from "@/components/ui/Button";
import { useTasteStore } from "@/stores/tasteStore";
import type { Event } from "@/types/event";
import {
  addDaysToDateString,
  formatEventDate,
  getEndOfMonthDateString,
  getTodayDateString,
  getWeekendRange,
} from "@/lib/dates";

// Ledger rows are short; a page is a good scroll, not a screenful.
const ROWS_PER_PAGE = 40;

interface EventGridProps {
  events: Event[];
}

export function EventGrid({ events }: EventGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Seeded once from ?q= (masthead search), then owned by local state.
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<EventViewMode>("all");
  const debouncedQuery = useDebounce(query);
  const followedArtists = useTasteStore((state) => state.followedArtists);
  const preferredGenres = useTasteStore((state) => state.preferredGenres);
  const savedEvents = useTasteStore((state) => state.savedEvents);

  // Drop ?q= after seeding so refresh, Reset, or later filter changes can't
  // resurrect a query the user has since edited or cleared.
  useEffect(() => {
    if (!searchParams.has("q")) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    const nextQuery = params.toString();
    // history API: Next keeps useSearchParams in sync without re-running the
    // server component (and its Supabase queries) like router.replace would.
    window.history.replaceState(null, "", nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }, [pathname, searchParams]);

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const whereParam = searchParams.get("where") ?? "";
  // Pre-"where" links used ?location=<raw event_location>.
  const legacyLocationParam = searchParams.get("location") ?? "";
  const typeParam = searchParams.get("type");
  const type = typeParam === "festival" || typeParam === "electronic" ? typeParam : "all";
  const sort: EventSort = searchParams.get("sort") === "bill" ? "bill" : "date";

  const eventsWithLocation = useMemo(
    () => events.filter((event) => hasEventLocation(event)),
    [events]
  );

  const places = useMemo(
    () => buildPlaces(eventsWithLocation.map((event) => event.event_location)),
    [eventsWithLocation]
  );

  const place = useMemo(() => {
    if (whereParam) return places.find((p) => p.key === whereParam) ?? null;
    if (legacyLocationParam) return findPlaceForLocation(places, legacyLocationParam);
    return null;
  }, [places, whereParam, legacyLocationParam]);

  const activePreset = useMemo(() => getActivePreset(from, to), [from, to]);

  const filteredByDate = useMemo(() => {
    if (!from && !to) return eventsWithLocation;

    return eventsWithLocation.filter((e) => {
      const eventDate = getDateFilterValue(e.event_date);
      if (!eventDate) return false;
      // Overlap test, so festivals already underway still match "from today".
      const endDate = e.event_end_date ? getDateFilterValue(e.event_end_date) : null;
      const lastDate = endDate && endDate > eventDate ? endDate : eventDate;
      if (from && lastDate < from) return false;
      if (to && eventDate > to) return false;
      return true;
    });
  }, [eventsWithLocation, from, to]);

  const filteredByType = useMemo(() => {
    if (type === "all") return filteredByDate;
    return filteredByDate.filter((event) => {
      if (type === "festival") return event.festivalind;
      if (type === "electronic") return event.electronicgenreind;
      return true;
    });
  }, [filteredByDate, type]);

  const filteredByLocation = useMemo(() => {
    if (!place) return filteredByType;
    return filteredByType.filter((event) => place.locations.has(event.event_location?.trim()));
  }, [filteredByType, place]);

  const filteredByViewMode = useMemo(() => {
    if (viewMode === "all") return filteredByLocation;

    if (viewMode === "saved") {
      const savedIds = new Set(savedEvents.map((event) => event.event_id));
      return filteredByLocation.filter((event) => savedIds.has(event.event_id));
    }

    const followedIds = new Set(followedArtists.map((artist) => artist.artist_id));
    const normalizedGenres = new Set(preferredGenres.map((genre) => genre.toLowerCase()));

    return [...filteredByLocation]
      .map((event) => ({ event, score: scoreEvent(event, followedIds, normalizedGenres) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.event);
  }, [filteredByLocation, followedArtists, preferredGenres, savedEvents, viewMode]);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return filteredByViewMode;
    const q = debouncedQuery.toLowerCase();
    return filteredByViewMode.filter(
      (e) =>
        e.event_name.toLowerCase().includes(q) ||
        e.event_location?.toLowerCase().includes(q) ||
        e.event_venue?.toLowerCase().includes(q) ||
        e.artists?.some((artist) => artist.artist_name.toLowerCase().includes(q))
    );
  }, [filteredByViewMode, debouncedQuery]);

  // "For you" is already ranked; sorting only applies to the plain list.
  const sorted = useMemo(() => {
    if (sort !== "bill" || viewMode === "recommended") return filtered;
    return [...filtered].sort(
      (a, b) =>
        (b.popularity_score ?? -1) - (a.popularity_score ?? -1) ||
        a.event_date.localeCompare(b.event_date)
    );
  }, [filtered, sort, viewMode]);
  const isRanked = viewMode === "recommended" || sort === "bill";

  const totalPages = Math.ceil(sorted.length / ROWS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  // Group the page by day. Ranked lists aren't in date order, so they stay flat.
  const grouped = useMemo(() => {
    const groups: Array<{ date: string | null; events: Event[] }> = [];
    if (isRanked) return [{ date: null, events: paginated }];

    paginated.forEach((event) => {
      const last = groups[groups.length - 1];
      if (last && last.date === event.event_date) last.events.push(event);
      else groups.push({ date: event.event_date, events: [event] });
    });
    return groups;
  }, [paginated, isRanked]);

  const hasActiveFilters = Boolean(
    from || to || place || type !== "all" || query || viewMode !== "all" || sort !== "date"
  );
  const hasTasteProfile =
    followedArtists.length > 0 || preferredGenres.length > 0 || savedEvents.length > 0;

  return (
    <div>
      <EventFilters
        query={query}
        onQueryChange={(q) => {
          setQuery(q);
          setCurrentPage(1);
        }}
        places={places}
        place={place}
        onPlaceChange={(next) => updateSearchParams({ where: next?.key ?? "", location: "" })}
        from={from}
        to={to}
        onFromChange={(value) => updateSearchParams({ from: value })}
        onToChange={(value) => updateSearchParams({ to: value })}
        activePreset={activePreset}
        onPresetChange={(preset) => updateSearchParams(getPresetRange(preset))}
        type={type}
        onTypeChange={(value) => updateSearchParams({ type: value === "all" ? "" : value })}
        sort={sort}
        onSortChange={(value) => updateSearchParams({ sort: value === "date" ? "" : value })}
        onReset={() => {
          setQuery("");
          setCurrentPage(1);
          setViewMode("all");
          router.replace(pathname);
        }}
        hasActiveFilters={hasActiveFilters}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setCurrentPage(1);
          setViewMode(mode);
        }}
        hasTasteProfile={hasTasteProfile}
        totalResults={sorted.length}
      />

      <div className="mt-2">
        {grouped.map(({ date, events: dayEvents }) => (
          <div
            key={date ?? "ranked"}
            className="grid grid-cols-[minmax(0,1fr)] gap-x-6 md:grid-cols-[8rem_minmax(0,1fr)]"
          >
            <h2 className="meta-strong sticky top-14 z-20 bg-ink py-3 md:static md:pt-4">
              {date ? (
                <>
                  <span className="block text-paper">
                    {formatEventDate(date, { weekday: "long" })}
                  </span>
                  <span className="block text-smoke">
                    {formatEventDate(date, { day: "2-digit", month: "long" })}
                  </span>
                </>
              ) : (
                <span className="block text-paper">
                  {viewMode === "recommended" ? "Ranked for you" : "Biggest bills first"}
                </span>
              )}
            </h2>
            <div>
              {dayEvents.map((event) => (
                <EventRow key={event.event_id} event={event} showDate={date === null} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="border-b border-line py-20 text-center">
          <p className="display text-3xl text-paper">No shows match</p>
          <p className="mt-3 text-sm text-smoke">
            {hasActiveFilters
              ? place?.kind === "city"
                ? "Widen the dates, or try the whole state. Sometimes the good night is a drive away."
                : "Widen the dates or clear a filter. You've out-niched the calendar."
              : "Shows sync from EDMTrain and Resident Advisor. Check back shortly."}
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
            )
            .map((page, i, arr) => (
              <span key={page} className="flex items-center">
                {i > 0 && arr[i - 1] !== page - 1 && <span className="meta px-1">…</span>}
                <Button
                  variant={page === currentPage ? "solid" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="min-w-[36px] font-mono"
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </Button>
              </span>
            ))}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      )}
    </div>
  );

  function updateSearchParams(updates: Record<string, string>) {
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }
}

function getPresetRange(preset: DatePreset | null): { from: string; to: string } {
  const today = getTodayDateString();
  switch (preset) {
    case "tonight":
      return { from: today, to: today };
    case "weekend":
      return getWeekendRange(today);
    case "next30":
      return { from: today, to: addDaysToDateString(today, 30) };
    case "month":
      return { from: today, to: getEndOfMonthDateString(today) };
    default:
      return { from: "", to: "" };
  }
}

/** Which preset (if any) the current from/to exactly matches, so its toggle reads as on. */
function getActivePreset(from: string, to: string): DatePreset | null {
  if (!from || !to) return null;
  const presets: DatePreset[] = ["tonight", "weekend", "next30", "month"];
  return (
    presets.find((preset) => {
      const range = getPresetRange(preset);
      return range.from === from && range.to === to;
    }) ?? null
  );
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateFilterValue(dateStr: string) {
  const directMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
  if (directMatch) return directMatch[0];

  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return null;

  return formatDateInput(parsed);
}

function scoreEvent(
  event: Event,
  followedArtistIds: Set<number>,
  preferredGenres: Set<string>
) {
  let score = 0;

  event.artists?.forEach((artist) => {
    if (followedArtistIds.has(artist.artist_id)) score += 6;
    artist.genres?.forEach((genre) => {
      if (preferredGenres.has(genre.toLowerCase())) score += 2;
    });
  });

  if (event.festivalind) score += 1;
  if (event.electronicgenreind) score += 1;

  return score;
}
