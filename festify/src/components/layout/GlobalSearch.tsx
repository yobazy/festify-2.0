"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, Calendar, MapPin, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { Event } from "@/types/event";
import type { Artist } from "@/types/artist";

interface SearchResults {
  events: Event[];
  artists: Artist[];
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ events: [], artists: [] });
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ events: [], artists: [] });
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      const supabase = createClient();
      const q = `%${debouncedQuery}%`;

      const [eventsRes, artistsRes] = await Promise.all([
        supabase
          .from("events")
          .select("event_id, event_name, event_date, event_venue, event_location, img_url, alt_img, use_alt")
          .or(`event_name.ilike.${q},event_venue.ilike.${q},event_location.ilike.${q}`)
          .order("event_date", { ascending: true })
          .limit(5),
        supabase
          .from("artists")
          .select("artist_id, artist_name, img_url, genres")
          .ilike("artist_name", q)
          .limit(5),
      ]);

      setResults({
        events: (eventsRes.data as Event[]) ?? [],
        artists: (artistsRes.data as Artist[]) ?? [],
      });
      setLoading(false);
    };

    fetchResults();
  }, [debouncedQuery]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const hasResults = results.events.length > 0 || results.artists.length > 0;
  const showDropdown = open && (hasResults || loading || query.length > 0);

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search trigger / input row */}
      <div className="flex items-center gap-2">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events, artists..."
                  className={cn(
                    "w-full h-9 pl-3 pr-8 rounded-lg text-sm",
                    "bg-white/8 border border-white/10",
                    "text-white placeholder:text-muted-foreground",
                    "focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25",
                    "transition-all duration-200"
                  )}
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "p-2 rounded-lg transition-all duration-200",
            "text-muted-foreground hover:text-white hover:bg-white/5",
            open && "text-white bg-white/5"
          )}
          aria-label="Search"
        >
          {open ? <X size={18} /> : <Search size={18} />}
        </button>
      </div>

      {/* Dropdown results */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute right-0 top-full mt-2 w-80",
              "glass border border-white/10 rounded-xl",
              "shadow-2xl shadow-black/60 overflow-hidden z-50"
            )}
          >
            {loading && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}

            {!loading && query && !hasResults && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No results for &quot;{query}&quot;
              </div>
            )}

            {!loading && results.events.length > 0 && (
              <div>
                <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                  <Calendar size={11} className="text-primary" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Events
                  </span>
                </div>
                {results.events.map((event) => {
                  const img = (event.use_alt ? event.alt_img : event.img_url) || PLACEHOLDER_IMAGE;
                  return (
                    <button
                      key={event.event_id}
                      onClick={() => handleSelect(`/events/${event.event_id}`)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5",
                        "hover:bg-white/5 transition-colors text-left"
                      )}
                    >
                      <div className="relative w-9 h-9 rounded-md overflow-hidden shrink-0">
                        <Image src={img} alt={event.event_name} fill className="object-cover opacity-80" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{event.event_name}</p>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <MapPin size={10} />
                          {event.event_location}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && results.artists.length > 0 && (
              <div className={cn(results.events.length > 0 && "border-t border-white/5")}>
                <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                  <Music size={11} className="text-primary" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Artists
                  </span>
                </div>
                {results.artists.map((artist) => (
                  <button
                    key={artist.artist_id}
                    onClick={() => handleSelect(`/artists/${artist.artist_id}`)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5",
                      "hover:bg-white/5 transition-colors text-left"
                    )}
                  >
                    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 ring-1 ring-white/10">
                      <Image
                        src={artist.img_url || PLACEHOLDER_IMAGE}
                        alt={artist.artist_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{artist.artist_name}</p>
                      {artist.genres && artist.genres.length > 0 && (
                        <p className="text-xs text-muted-foreground truncate">
                          {artist.genres.slice(0, 2).join(", ")}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {hasResults && (
              <div className="border-t border-white/5 px-4 py-2.5">
                <button
                  onClick={() => {
                    router.push(`/events?q=${encodeURIComponent(query)}`);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  See all results for &quot;{query}&quot; →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
