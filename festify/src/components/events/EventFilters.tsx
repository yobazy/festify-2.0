"use client";

import { SearchInput } from "@/components/ui/SearchInput";
import { cn } from "@/lib/utils";

type EventTypeFilter = "all" | "festival" | "electronic" | "livestream";
type EventViewMode = "all" | "recommended" | "saved";

interface EventFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  totalResults: number;
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  type: EventTypeFilter;
  onTypeChange: (type: EventTypeFilter) => void;
  onThisMonth: () => void;
  onNext30Days: () => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  viewMode: EventViewMode;
  onViewModeChange: (mode: EventViewMode) => void;
  hasTasteProfile: boolean;
}

export function EventFilters({
  query,
  onQueryChange,
  totalResults,
  from,
  to,
  onFromChange,
  onToChange,
  type,
  onTypeChange,
  onThisMonth,
  onNext30Days,
  onReset,
  hasActiveFilters,
  viewMode,
  onViewModeChange,
  hasTasteProfile,
}: EventFiltersProps) {
  const typeOptions: Array<{ value: EventTypeFilter; label: string }> = [
    { value: "all", label: "All events" },
    { value: "festival", label: "Festivals" },
    { value: "electronic", label: "Electronic" },
    { value: "livestream", label: "Livestreams" },
  ];

  return (
    <div className="glass mb-8 space-y-4 p-4">
      {hasTasteProfile && (
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "Everything" },
            { value: "recommended", label: "For you" },
            { value: "saved", label: "Saved" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onViewModeChange(option.value as EventViewMode)}
              className={cn(
                "rounded-full px-3 py-2 text-xs font-medium transition-all",
                viewMode === option.value
                  ? "bg-primary text-black"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <SearchInput
          value={query}
          onChange={onQueryChange}
          placeholder="Search events, venues, locations..."
          className="flex-1"
        />

        <div className="flex w-full items-center gap-2 lg:w-auto">
          <input
            type="date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/25 sm:w-[150px]"
            aria-label="From date"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/25 sm:w-[150px]"
            aria-label="To date"
          />
        </div>

        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {totalResults} event{totalResults !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onTypeChange(option.value)}
              className={cn(
                "rounded-full px-3 py-2 text-xs font-medium transition-all",
                type === option.value
                  ? "bg-primary text-black"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onThisMonth}
            className="rounded-full bg-white/5 px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-white/10 hover:text-white"
          >
            This month
          </button>
          <button
            type="button"
            onClick={onNext30Days}
            className="rounded-full bg-white/5 px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-white/10 hover:text-white"
          >
            Next 30 days
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-white transition-all hover:border-white/20 hover:bg-white/5"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {(from || to) && (
        <div className="flex flex-wrap gap-2">
          <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
            {formatDateRangeLabel(from, to)}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDateRangeLabel(from: string, to: string) {
  if (from && to) {
    return `Showing ${formatDateLabel(from)} to ${formatDateLabel(to)}`;
  }

  if (from) {
    return `Showing from ${formatDateLabel(from)}`;
  }

  return `Showing through ${formatDateLabel(to)}`;
}

function formatDateLabel(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
