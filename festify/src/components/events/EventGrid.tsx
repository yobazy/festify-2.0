"use client";

import { useMemo, useState } from "react";
import { EventCard } from "./EventCard";
import { EventFilters } from "./EventFilters";
import { useDebounce } from "@/hooks/useDebounce";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTasteStore } from "@/stores/tasteStore";
import type { Event } from "@/types/event";

interface EventGridProps {
  events: Event[];
}

export function EventGrid({ events }: EventGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"all" | "recommended" | "saved">(
    "all"
  );
  const debouncedQuery = useDebounce(query);
  const followedArtists = useTasteStore((state) => state.followedArtists);
  const preferredGenres = useTasteStore((state) => state.preferredGenres);
  const savedEvents = useTasteStore((state) => state.savedEvents);

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const type =
    (searchParams.get("type") as
      | "all"
      | "festival"
      | "electronic"
      | "livestream"
      | null) ?? "all";

  const filteredByDate = useMemo(() => {
    if (!from && !to) return events;

    return events.filter((e) => {
      const eventDate = getDateFilterValue(e.event_date);
      if (!eventDate) return false;
      if (from && eventDate < from) return false;
      if (to && eventDate > to) return false;
      return true;
    });
  }, [events, from, to]);

  const filteredByType = useMemo(() => {
    if (type === "all") return filteredByDate;

    return filteredByDate.filter((event) => {
      if (type === "festival") return event.festivalind;
      if (type === "livestream") return event.livestreamind;
      if (type === "electronic") return event.electronicgenreind;
      return true;
    });
  }, [filteredByDate, type]);

  const filteredByViewMode = useMemo(() => {
    if (viewMode === "all") return filteredByType;

    if (viewMode === "saved") {
      const savedIds = new Set(savedEvents.map((event) => event.event_id));
      return filteredByType.filter((event) => savedIds.has(event.event_id));
    }

    const followedIds = new Set(
      followedArtists.map((artist) => artist.artist_id)
    );
    const normalizedGenres = new Set(
      preferredGenres.map((genre) => genre.toLowerCase())
    );

    return [...filteredByType]
      .map((event) => ({
        event,
        score: scoreEvent(event, followedIds, normalizedGenres),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.event);
  }, [filteredByType, followedArtists, preferredGenres, savedEvents, viewMode]);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return filteredByViewMode;
    const q = debouncedQuery.toLowerCase();
    return filteredByViewMode.filter(
      (e) =>
        e.event_name.toLowerCase().includes(q) ||
        e.event_location?.toLowerCase().includes(q) ||
        e.event_venue?.toLowerCase().includes(q)
    );
  }, [filteredByViewMode, debouncedQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Group by month
  const grouped = useMemo(() => {
    const groups: Record<string, Event[]> = {};
    paginated.forEach((event) => {
      const date = new Date(event.event_date);
      const key = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
    });
    return groups;
  }, [paginated]);

  const hasActiveFilters = Boolean(
    from || to || type !== "all" || query || viewMode !== "all"
  );
  const hasTasteProfile =
    followedArtists.length > 0 ||
    preferredGenres.length > 0 ||
    savedEvents.length > 0;

  return (
    <div>
      <EventFilters
        query={query}
        onQueryChange={(q) => {
          setQuery(q);
          setCurrentPage(1);
        }}
        from={from}
        to={to}
        onFromChange={(value) => updateSearchParam("from", value)}
        onToChange={(value) => updateSearchParam("to", value)}
        type={type}
        onTypeChange={(value) => updateSearchParam("type", value === "all" ? "" : value)}
        onThisMonth={() => {
          const today = new Date();
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          updateDateRange(formatDateInput(today), formatDateInput(endOfMonth));
        }}
        onNext30Days={() => {
          const today = new Date();
          const nextThirtyDays = new Date(today);
          nextThirtyDays.setDate(today.getDate() + 30);
          updateDateRange(formatDateInput(today), formatDateInput(nextThirtyDays));
        }}
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
        totalResults={filtered.length}
      />

      {Object.entries(grouped).map(([month, monthEvents]) => (
        <div key={month} className="mb-10">
          <h3 className="font-brand text-lg text-muted-foreground mb-4 sticky top-16 z-10 bg-background/80 backdrop-blur-sm py-2">
            {month}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monthEvents.map((event, i) => (
              <EventCard key={event.event_id} event={event} index={i} />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No events found</p>
          <p className="text-muted-foreground/60 text-sm mt-2">
            Try adjusting your search
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1
            )
            .map((page, i, arr) => (
              <span key={page} className="flex items-center">
                {i > 0 && arr[i - 1] !== page - 1 && (
                  <span className="text-muted-foreground px-1">...</span>
                )}
                <Button
                  variant={page === currentPage ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="min-w-[36px]"
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
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      )}
    </div>
  );

  function updateDateRange(nextFrom: string, nextTo: string) {
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());

    if (nextFrom) params.set("from", nextFrom);
    else params.delete("from");

    if (nextTo) params.set("to", nextTo);
    else params.delete("to");

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }

  function updateSearchParam(key: string, value: string) {
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(key, value);
    else params.delete(key);

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }
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
    if (followedArtistIds.has(artist.artist_id)) {
      score += 6;
    }

    artist.genres?.forEach((genre) => {
      if (preferredGenres.has(genre.toLowerCase())) {
        score += 2;
      }
    });
  });

  if (event.festivalind) score += 1;
  if (event.electronicgenreind) score += 1;

  return score;
}
