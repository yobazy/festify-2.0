"use client";

import { useMemo, useState } from "react";
import { ArtistCard } from "./ArtistCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import type { Artist } from "@/types/artist";

const ARTISTS_PER_PAGE = 20;

interface ArtistGridProps {
  artists: Artist[];
}

export function ArtistGrid({ artists }: ArtistGridProps) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedQuery = useDebounce(query);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return artists;
    const q = debouncedQuery.toLowerCase();
    return artists.filter((a) =>
      a.artist_name.toLowerCase().includes(q)
    );
  }, [artists, debouncedQuery]);

  const totalPages = Math.ceil(filtered.length / ARTISTS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ARTISTS_PER_PAGE,
    currentPage * ARTISTS_PER_PAGE
  );

  return (
    <div>
      {/* Search */}
      <div className="glass p-4 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <SearchInput
          value={query}
          onChange={(q) => {
            setQuery(q);
            setCurrentPage(1);
          }}
          placeholder="Search artists..."
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {filtered.length} artist{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {paginated.map((artist, i) => (
          <ArtistCard key={artist.artist_id} artist={artist} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No artists found</p>
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

          <span className="text-sm text-muted-foreground px-3">
            Page {currentPage} of {totalPages}
          </span>

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
