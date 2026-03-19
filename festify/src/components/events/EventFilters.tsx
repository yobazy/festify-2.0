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
    <div className="border border-white/[0.06] bg-[#0a0a0a] p-4 mb-8 space-y-3">
      {/* Top row: search + result count */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <SearchInput
          value={query}
          onChange={onQueryChange}
          placeholder="Search events, venues, locations..."
          className="flex-1"
        />
        <span className="eyebrow text-white/25 whitespace-nowrap">
          {totalResults}&nbsp;{totalResults !== 1 ? "Events" : "Event"}
        </span>
      </div>

      {/* Bottom row: date chips + location */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Date range chips — stark, square */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {DATE_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => onDateRangeChange(chip.value)}
              className={cn(
                "px-3 py-1 eyebrow transition-all duration-150",
                dateRange === chip.value
                  ? "bg-neon text-black"
                  : "border border-white/10 text-white/30 hover:text-white hover:border-white/25"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Location dropdown */}
        {uniqueLocations.length > 0 && (
          <div className="relative flex items-center gap-2 ml-auto">
            <MapPin size={12} className="text-white/25 shrink-0" />
            <div className="relative">
              <select
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                className={cn(
                  "appearance-none pr-5 pl-1 py-1",
                  "bg-transparent border-b border-white/10",
                  "eyebrow text-white/30 focus:outline-none",
                  "transition-colors cursor-pointer hover:border-white/25",
                  location && "text-white border-neon"
                )}
              >
                <option value="">All Locations</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc} className="bg-[#0a0a0a] text-white">
                    {loc}
                  </option>
                ))}
              </select>
              <Filter
                size={9}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
