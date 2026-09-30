"use client";

import { SearchInput } from "@/components/ui/SearchInput";
import { PlacePicker } from "./PlacePicker";
import { cn } from "@/lib/utils";
import type { Place } from "@/lib/places";

export type EventTypeFilter = "all" | "festival" | "electronic";
export type EventViewMode = "all" | "recommended" | "saved";
export type EventSort = "date" | "bill";
export type DatePreset = "tonight" | "weekend" | "next30" | "month";

interface EventFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  totalResults: number;
  places: Place[];
  place: Place | null;
  onPlaceChange: (place: Place | null) => void;
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  activePreset: DatePreset | null;
  onPresetChange: (preset: DatePreset | null) => void;
  type: EventTypeFilter;
  onTypeChange: (type: EventTypeFilter) => void;
  sort: EventSort;
  onSortChange: (sort: EventSort) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  viewMode: EventViewMode;
  onViewModeChange: (mode: EventViewMode) => void;
  hasTasteProfile: boolean;
}

const PRESETS: Array<{ value: DatePreset; label: string }> = [
  { value: "tonight", label: "Tonight" },
  { value: "weekend", label: "This weekend" },
  { value: "next30", label: "Next 30 days" },
  { value: "month", label: "This month" },
];

const dateFieldClass =
  "h-11 w-full min-w-0 border-0 bg-transparent font-mono text-xs text-paper [color-scheme:dark] focus:outline-none";

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "border-b pb-0.5 text-sm transition-colors",
        active
          ? "border-paper text-paper"
          : "border-transparent text-smoke hover:border-line-strong hover:text-paper"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="hidden h-4 w-px bg-line sm:block" aria-hidden="true" />;
}

export function EventFilters({
  query,
  onQueryChange,
  totalResults,
  places,
  place,
  onPlaceChange,
  from,
  to,
  onFromChange,
  onToChange,
  activePreset,
  onPresetChange,
  type,
  onTypeChange,
  sort,
  onSortChange,
  onReset,
  hasActiveFilters,
  viewMode,
  onViewModeChange,
  hasTasteProfile,
}: EventFiltersProps) {
  return (
    <div className="pt-4">
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
        <SearchInput
          className="col-span-2 sm:col-span-1"
          value={query}
          onChange={onQueryChange}
          placeholder="Artist, event, venue"
          label="Search shows"
        />

        <div className="col-span-2 sm:col-span-1">
          <PlacePicker places={places} value={place} onChange={onPlaceChange} />
        </div>

        <label className="flex items-center gap-3 border-b border-line focus-within:border-paper">
          <span className="meta shrink-0">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className={cn(dateFieldClass, !from && "text-smoke")}
          />
        </label>

        <label className="flex items-center gap-3 border-b border-line focus-within:border-paper">
          <span className="meta shrink-0">To</span>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => onToChange(e.target.value)}
            className={cn(dateFieldClass, !to && "text-smoke")}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line py-3">
        <Toggle active={type === "all"} onClick={() => onTypeChange("all")}>
          Everything
        </Toggle>
        <Toggle active={type === "festival"} onClick={() => onTypeChange("festival")}>
          Festivals
        </Toggle>
        <Toggle active={type === "electronic"} onClick={() => onTypeChange("electronic")}>
          Electronic
        </Toggle>

        <Divider />
        {PRESETS.map((preset) => (
          <Toggle
            key={preset.value}
            active={activePreset === preset.value}
            onClick={() => onPresetChange(activePreset === preset.value ? null : preset.value)}
          >
            {preset.label}
          </Toggle>
        ))}

        {hasTasteProfile && (
          <>
            <Divider />
            <Toggle
              active={viewMode === "recommended"}
              onClick={() => onViewModeChange(viewMode === "recommended" ? "all" : "recommended")}
            >
              For you
            </Toggle>
            <Toggle
              active={viewMode === "saved"}
              onClick={() => onViewModeChange(viewMode === "saved" ? "all" : "saved")}
            >
              Saved
            </Toggle>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
        <p className="meta" aria-live="polite">
          <span className="text-paper">{totalResults}</span>{" "}
          {totalResults === 1 ? "show" : "shows"}
          {place && <> in {place.label}</>}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="ml-4 text-paper underline underline-offset-4"
            >
              Clear filters
            </button>
          )}
        </p>

        {viewMode !== "recommended" && (
          <div className="flex items-center gap-4">
            <span className="meta">Sort</span>
            <Toggle active={sort === "date"} onClick={() => onSortChange("date")}>
              Soonest
            </Toggle>
            <Toggle active={sort === "bill"} onClick={() => onSortChange("bill")}>
              Biggest bills
            </Toggle>
          </div>
        )}
      </div>
    </div>
  );
}
