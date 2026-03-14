"use client";

import { SearchInput } from "@/components/ui/SearchInput";

interface EventFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  totalResults: number;
}

export function EventFilters({
  query,
  onQueryChange,
  totalResults,
}: EventFiltersProps) {
  return (
    <div className="glass p-4 mb-8 flex flex-col sm:flex-row items-center gap-4">
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
  );
}
