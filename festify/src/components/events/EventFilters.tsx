"use client";

import { SearchInput } from "@/components/ui/SearchInput";

interface EventFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  totalResults: number;
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}

export function EventFilters({
  query,
  onQueryChange,
  totalResults,
  from,
  to,
  onFromChange,
  onToChange,
}: EventFiltersProps) {
  return (
    <div className="glass p-4 mb-8 flex flex-col sm:flex-row items-center gap-4">
      <SearchInput
        value={query}
        onChange={onQueryChange}
        placeholder="Search events, venues, locations..."
        className="flex-1"
      />

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all duration-200 w-full sm:w-[150px]"
          aria-label="From date"
        />
        <span className="text-muted-foreground text-sm">to</span>
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all duration-200 w-full sm:w-[150px]"
          aria-label="To date"
        />
      </div>

      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {totalResults} event{totalResults !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
