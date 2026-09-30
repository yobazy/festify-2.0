"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { EVENT_PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE } from "@/lib/constants";
import { addDaysToDateString, formatEventDate, getTodayDateString, isEventUpcoming } from "@/lib/dates";
import { getEventLocationLabel, normalizeEventImageUrl } from "@/lib/event-data";
import type { Event } from "@/types/event";
import type { Artist } from "@/types/artist";

interface SearchResults {
  query: string;
  events: Event[];
  artists: Artist[];
}

// Characters that would break a PostgREST `.or()`/`ilike` filter string.
function sanitizeSearchTerm(value: string) {
  return value.replace(/[%_,()*\\]/g, " ").trim().slice(0, 80);
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Results are keyed by the query that produced them, so a slow response for
  // an old query can never show under a newer one.
  const [results, setResults] = useState<SearchResults>({
    query: "",
    events: [],
    artists: [],
  });
  const debouncedQuery = useDebounce(query, 300);
  const searchTerm = sanitizeSearchTerm(debouncedQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!searchTerm) return;

    let cancelled = false;
    const supabase = createClient();
    const q = `%${searchTerm}%`;
    const today = getTodayDateString();

    Promise.all([
      supabase
        .from("events")
        .select(
          "event_id, event_name, event_date, event_end_date, event_venue, event_location, img_url, alt_img, use_alt"
        )
        .or(`event_name.ilike.${q},event_venue.ilike.${q},event_location.ilike.${q}`)
        // A week of slack catches festivals that started recently but are
        // still running; isEventUpcoming makes the exact cut below.
        .gte("event_date", addDaysToDateString(today, -7))
        .order("event_date", { ascending: true })
        .limit(15),
      supabase
        .from("artists")
        .select("artist_id, artist_name, img_url, genres")
        .ilike("artist_name", q)
        .order("popularity", { ascending: false, nullsFirst: false })
        .limit(5),
    ]).then(([eventsRes, artistsRes]) => {
      if (cancelled) return;
      setResults({
        query: searchTerm,
        events: ((eventsRes.data as Event[] | null) ?? [])
          .filter((event) => isEventUpcoming(event, today))
          .slice(0, 5),
        artists: (artistsRes.data as Artist[] | null) ?? [],
      });
    });

    return () => {
      cancelled = true;
    };
  }, [searchTerm]);

  const hasQuery = searchTerm.length > 0;
  const loading = hasQuery && results.query !== searchTerm;
  const visibleResults = hasQuery && !loading ? results : { events: [], artists: [] };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
      // "/" focuses search, like a listings site should.
      if (e.key === "/" && !isTypingTarget(e.target)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const hasResults =
    visibleResults.events.length > 0 || visibleResults.artists.length > 0;
  const showDropdown = open && (hasResults || loading || hasQuery);

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1">
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (query.trim()) handleSelect(`/events?q=${encodeURIComponent(query.trim())}`);
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Artist, event, city"
                  aria-label="Search events and artists"
                  className={cn(
                    "h-8 w-full border-0 border-b border-line bg-transparent px-1 text-sm",
                    "text-paper placeholder:text-smoke focus:border-paper focus:outline-none"
                  )}
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setOpen((o) => !o)}
          className="p-2 text-smoke transition-colors hover:text-paper"
          aria-label={open ? "Close search" : "Search"}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Search size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full z-50 mt-3 w-[22rem] border border-line bg-ink shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
          >
            {loading && <p className="meta px-4 py-5">Searching</p>}

            {!loading && hasQuery && !hasResults && (
              <p className="px-4 py-5 text-sm text-smoke">
                Nothing listed for &ldquo;{query}&rdquo;.
              </p>
            )}

            {!loading && visibleResults.events.length > 0 && (
              <div>
                <p className="meta border-b border-line px-4 py-2">Shows</p>
                {visibleResults.events.map((event) => {
                  const img =
                    normalizeEventImageUrl(event.use_alt ? event.alt_img : event.img_url) ??
                    EVENT_PLACEHOLDER_IMAGE;
                  return (
                    <button
                      key={event.event_id}
                      onClick={() => handleSelect(`/events/${event.event_id}`)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-ink-2"
                    >
                      <span className="meta-strong w-12 shrink-0 leading-tight">
                        {formatEventDate(event.event_date, { day: "2-digit", month: "short" })}
                      </span>
                      <span className="relative h-9 w-9 shrink-0 overflow-hidden bg-ink-3">
                        <Image src={img} alt="" fill sizes="36px" className="img-poster object-cover" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-paper">{event.event_name}</span>
                        <span className="meta block truncate">
                          {getEventLocationLabel(event) ?? "Venue TBA"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && visibleResults.artists.length > 0 && (
              <div className={cn(visibleResults.events.length > 0 && "border-t border-line")}>
                <p className="meta border-b border-line px-4 py-2">Artists</p>
                {visibleResults.artists.map((artist) => (
                  <button
                    key={artist.artist_id}
                    onClick={() => handleSelect(`/artists/${artist.artist_id}`)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-ink-2"
                  >
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden bg-ink-3">
                      <Image
                        src={artist.img_url || PLACEHOLDER_IMAGE}
                        alt=""
                        fill
                        sizes="36px"
                        className="img-poster object-cover"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-paper">{artist.artist_name}</span>
                      {artist.genres && artist.genres.length > 0 && (
                        <span className="meta block truncate">
                          {artist.genres.slice(0, 2).join(", ")}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {hasResults && (
              <div className="border-t border-line px-4 py-2.5">
                <button
                  onClick={() => handleSelect(`/events?q=${encodeURIComponent(query)}`)}
                  className="meta-strong underline-offset-4 hover:underline"
                >
                  All shows for &ldquo;{query}&rdquo;
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}
