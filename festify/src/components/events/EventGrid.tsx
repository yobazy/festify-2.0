"use client";

import { useMemo, useState } from "react";
import { EventCard } from "./EventCard";
import { EventFilters } from "./EventFilters";
import { useDebounce } from "@/hooks/useDebounce";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Event } from "@/types/event";

interface EventGridProps {
  events: Event[];
}

export function EventGrid({ events }: EventGridProps) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedQuery = useDebounce(query);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return events;
    const q = debouncedQuery.toLowerCase();
    return events.filter(
      (e) =>
        e.event_name.toLowerCase().includes(q) ||
        e.event_location?.toLowerCase().includes(q) ||
        e.event_venue?.toLowerCase().includes(q)
    );
  }, [events, debouncedQuery]);

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

  return (
    <div>
      <EventFilters
        query={query}
        onQueryChange={(q) => {
          setQuery(q);
          setCurrentPage(1);
        }}
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
}
