"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { placeMatches, type Place } from "@/lib/places";

interface PlacePickerProps {
  places: Place[];
  value: Place | null;
  onChange: (place: Place | null) => void;
}

/**
 * Type-to-filter picker for cities, metros and regions. Busiest places come
 * first, so the common case is one click; typing narrows the long tail.
 */
export function PlacePicker({ places, value, onChange }: PlacePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const results = useMemo(() => places.filter((place) => placeMatches(place, query)), [places, query]);
  const firstRegionIndex = results.findIndex((place) => place.kind === "region");

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    inputRef.current?.focus();
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  };

  const choose = (place: Place | null) => {
    onChange(place);
    close();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(results.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (results[activeIndex]) choose(results[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-11 w-full items-center gap-2 border-0 border-b bg-transparent pr-6 text-left text-[15px] transition-colors focus:outline-none",
          open ? "border-paper" : "border-line focus-visible:border-paper",
          value ? "text-paper" : "text-smoke"
        )}
      >
        <MapPin size={16} className="shrink-0 text-smoke" aria-hidden="true" />
        <span className="truncate">{value ? value.label : "Anywhere"}</span>
      </button>

      {value ? (
        <button
          type="button"
          onClick={() => choose(null)}
          aria-label={`Clear ${value.label}`}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-smoke transition-colors hover:text-paper"
        >
          <X size={14} />
        </button>
      ) : (
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-smoke"
          aria-hidden="true"
        />
      )}

      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 min-w-[18rem] border border-line-strong bg-ink">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="City, state or country"
            role="combobox"
            aria-label="Filter places"
            aria-controls={listId}
            aria-expanded="true"
            aria-activedescendant={results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
            className="h-11 w-full border-0 border-b border-line bg-transparent px-3 text-sm text-paper placeholder:text-smoke focus:outline-none"
          />

          <ul ref={listRef} id={listId} role="listbox" className="max-h-80 overflow-y-auto py-1">
            {results.length === 0 && (
              <li className="px-3 py-4 text-sm text-smoke">No shows there yet.</li>
            )}
            {results.map((place, index) => (
              <li key={place.key} role="presentation">
                {index === firstRegionIndex && (
                  <p className="meta mt-1 border-t border-line px-3 pb-1 pt-3" aria-hidden="true">
                    Whole state or country
                  </p>
                )}
                <div
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={value?.key === place.key}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(place)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex cursor-pointer items-baseline justify-between gap-4 px-3 py-2",
                    index === activeIndex && "bg-ink-2"
                  )}
                >
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block truncate text-sm",
                        value?.key === place.key ? "font-semibold text-paper" : "text-paper-2"
                      )}
                    >
                      {place.label}
                    </span>
                    {place.detail && <span className="meta block truncate">{place.detail}</span>}
                  </span>
                  <span className="meta shrink-0">{place.count}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
