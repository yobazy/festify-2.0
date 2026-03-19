"use client";

import { Filter, MapPin } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { cn } from "@/lib/utils";

export type DateRange = "all" | "week" | "month" | "3months";

const DATE_CHIPS: { label: string; value: DateRange }[] = [
  { label: "All", value: "all" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Next 3 Months", value: "3months" },
];

interface EventFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (r: DateRange) => void;
  location: string;
  onLocationChange: (loc: string) => void;
  uniqueLocations: string[];
  totalResults: number;
}

export function EventFilters({
  query,
  onQueryChange,
  dateRange,
  onDateRangeChange,
  location,
  onLocationChange,
  uniqueLocations,
  totalResults,
}: EventFiltersProps) {
  return (
    <div className="glass p-4 mb-8 space-y-3">
      {/* Top row: search + result count */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <SearchInput
          value={query}
          onChange={onQueryChange}
          placeholder="Search events, venues, locations..."
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {totalResults} event{totalResults !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Bottom row: date chips + location */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date range chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {DATE_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => onDateRangeChange(chip.value)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
                dateRange === chip.value
                  ? "gradient-purple text-white"
                  : "bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Location dropdown */}
        {uniqueLocations.length > 0 && (
          <div className="relative flex items-center gap-1.5 ml-auto">
            <MapPin size={14} className="text-muted-foreground shrink-0" />
            <div className="relative">
              <select
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                className={cn(
                  "appearance-none pr-6 pl-2 py-1 rounded-lg text-xs",
                  "bg-white/5 border border-white/10",
                  "text-muted-foreground focus:outline-none focus:border-primary/50",
                  "transition-colors cursor-pointer hover:border-white/20",
                  location && "text-white border-primary/30"
                )}
              >
                <option value="">All Locations</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc} className="bg-card text-white">
                    {loc}
                  </option>
                ))}
              </select>
              <Filter
                size={10}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
