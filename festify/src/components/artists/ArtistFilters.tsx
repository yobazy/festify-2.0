"use client";

import { ChevronDown } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { cn } from "@/lib/utils";

export type ArtistSort = "popular" | "name";
export type ArtistViewMode = "all" | "recommended" | "following";

interface ArtistFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  sort: ArtistSort;
  onSortChange: (sort: ArtistSort) => void;
  genre: string;
  genreOptions: string[];
  onGenreChange: (genre: string) => void;
  spotifyOnly: boolean;
  onSpotifyOnlyChange: (next: boolean) => void;
  viewMode: ArtistViewMode;
  onViewModeChange: (mode: ArtistViewMode) => void;
  hasTasteProfile: boolean;
  totalResults: number;
  hasActiveFilters: boolean;
  onReset: () => void;
}

const fieldClass =
  "h-11 w-full border-0 border-b border-line bg-transparent pr-6 text-sm text-paper focus:border-paper focus:outline-none";

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

export function ArtistFilters({
  query,
  onQueryChange,
  sort,
  onSortChange,
  genre,
  genreOptions,
  onGenreChange,
  spotifyOnly,
  onSpotifyOnlyChange,
  viewMode,
  onViewModeChange,
  hasTasteProfile,
  totalResults,
  hasActiveFilters,
  onReset,
}: ArtistFiltersProps) {
  const activeGenre = genre.toLowerCase();

  return (
    <div className="pt-4">
      <div className="grid gap-x-6 gap-y-2 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SearchInput
          value={query}
          onChange={onQueryChange}
          placeholder="Artist name"
          label="Search artists"
        />

        <label className="relative block">
          <span className="sr-only">Sort</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value === "name" ? "name" : "popular")}
            className={fieldClass}
          >
            <option value="popular">Popularity</option>
            <option value="name">A to Z</option>
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-smoke"
            aria-hidden="true"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line py-3">
        <Toggle active={!genre} onClick={() => onGenreChange("")}>
          All
        </Toggle>
        {genreOptions.map((genreName) => (
          <Toggle
            key={genreName}
            active={activeGenre === genreName.toLowerCase()}
            onClick={() => onGenreChange(genreName)}
          >
            {genreName}
          </Toggle>
        ))}

        <span className="h-4 w-px bg-line" aria-hidden="true" />
        <Toggle active={spotifyOnly} onClick={() => onSpotifyOnlyChange(!spotifyOnly)}>
          Spotify linked
        </Toggle>

        {hasTasteProfile && (
          <>
            <span className="h-4 w-px bg-line" aria-hidden="true" />
            <Toggle
              active={viewMode === "recommended"}
              onClick={() =>
                onViewModeChange(viewMode === "recommended" ? "all" : "recommended")
              }
            >
              For you
            </Toggle>
            <Toggle
              active={viewMode === "following"}
              onClick={() => onViewModeChange(viewMode === "following" ? "all" : "following")}
            >
              Following
            </Toggle>
          </>
        )}

        <span className="meta ml-auto">
          {totalResults} {totalResults === 1 ? "artist" : "artists"}
          {hasActiveFilters && (
            <>
              {" "}
              <button
                type="button"
                onClick={onReset}
                className="text-paper underline underline-offset-4"
              >
                Clear
              </button>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
