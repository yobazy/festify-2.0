"use client";

import { useMemo, useState } from "react";
import { ArtistCard } from "./ArtistCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTasteStore } from "@/stores/tasteStore";
import type { Artist } from "@/types/artist";

const ARTISTS_PER_PAGE = 20;

interface ArtistGridProps {
  artists: Artist[];
}

export function ArtistGrid({ artists }: ArtistGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"all" | "recommended" | "following">(
    "all"
  );
  const debouncedQuery = useDebounce(query);
  const followedArtists = useTasteStore((state) => state.followedArtists);
  const preferredGenres = useTasteStore((state) => state.preferredGenres);

  const genre = searchParams.get("genre") ?? "";
  const sort = searchParams.get("sort") ?? "popular";
  const spotifyOnly = searchParams.get("spotify") === "1";

  const topGenres = useMemo(() => {
    const counts = new Map<string, number>();

    artists.forEach((artist) => {
      artist.genres?.forEach((genreName) => {
        const normalized = genreName.trim();
        if (!normalized) return;
        counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([genreName]) => genreName);
  }, [artists]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    const followedIds = new Set(
      followedArtists.map((artist) => artist.artist_id)
    );
    const normalizedPreferredGenres = new Set(
      preferredGenres.map((entry) => entry.toLowerCase())
    );

    const nextArtists = artists.filter((artist) => {
      const matchesQuery = q
        ? artist.artist_name.toLowerCase().includes(q)
        : true;
      const matchesGenre = genre
        ? artist.genres?.some(
            (artistGenre) => artistGenre.toLowerCase() === genre.toLowerCase()
          ) ?? false
        : true;
      const matchesSpotify = spotifyOnly ? Boolean(artist.spotify_link) : true;
      const matchesViewMode =
        viewMode === "all"
          ? true
          : viewMode === "following"
            ? followedIds.has(artist.artist_id)
            : getArtistRecommendationScore(
                artist,
                followedIds,
                normalizedPreferredGenres
              ) > 0;

      return matchesQuery && matchesGenre && matchesSpotify && matchesViewMode;
    });

    return nextArtists.sort((a, b) => {
      if (viewMode === "recommended") {
        return (
          getArtistRecommendationScore(
            b,
            followedIds,
            normalizedPreferredGenres
          ) -
            getArtistRecommendationScore(
              a,
              followedIds,
              normalizedPreferredGenres
            ) || a.artist_name.localeCompare(b.artist_name)
        );
      }

      if (sort === "name") {
        return a.artist_name.localeCompare(b.artist_name);
      }

      const popularityA = a.popularity ?? -1;
      const popularityB = b.popularity ?? -1;

      if (popularityA !== popularityB) {
        return popularityB - popularityA;
      }

      return a.artist_name.localeCompare(b.artist_name);
    });
  }, [
    artists,
    debouncedQuery,
    followedArtists,
    genre,
    preferredGenres,
    sort,
    spotifyOnly,
    viewMode,
  ]);

  const totalPages = Math.ceil(filtered.length / ARTISTS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ARTISTS_PER_PAGE,
    currentPage * ARTISTS_PER_PAGE
  );

  return (
    <div>
      <div className="glass mb-8 space-y-4 p-4">
        {(followedArtists.length > 0 || preferredGenres.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All artists" },
              { value: "recommended", label: "For you" },
              { value: "following", label: "Following" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setCurrentPage(1);
                  setViewMode(
                    option.value as "all" | "recommended" | "following"
                  );
                }}
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
            onChange={(value) => {
              setQuery(value);
              setCurrentPage(1);
            }}
            placeholder="Search artists..."
            className="flex-1"
          />

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Sort</span>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/25"
            >
              <option value="popular">Popularity</option>
              <option value="name">A-Z</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => updateParam("spotify", spotifyOnly ? "" : "1")}
            className={cn(
              "rounded-full px-3 py-2 text-xs font-medium transition-all",
              spotifyOnly
                ? "bg-primary text-black"
                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
            )}
          >
            Spotify linked
          </button>

          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {filtered.length} artist{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {topGenres.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Genres
            </span>
            <button
              type="button"
              onClick={() => updateParam("genre", "")}
              className={cn(
                "rounded-full px-3 py-2 text-xs font-medium transition-all",
                !genre
                  ? "bg-primary text-black"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
              )}
            >
              All
            </button>
            {topGenres.map((genreName) => (
              <button
                key={genreName}
                type="button"
                onClick={() => updateParam("genre", genreName)}
                className={cn(
                  "rounded-full px-3 py-2 text-xs font-medium transition-all",
                  genre.toLowerCase() === genreName.toLowerCase()
                    ? "bg-primary text-black"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                )}
              >
                {genreName}
              </button>
            ))}
          </div>
        )}

        {(genre || spotifyOnly || query || viewMode !== "all") && (
          <div className="flex flex-wrap gap-2">
            {genre && (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                Genre: {genre}
              </span>
            )}
            {viewMode === "recommended" && (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                For you
              </span>
            )}
            {viewMode === "following" && (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                Following only
              </span>
            )}
            {spotifyOnly && (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                Spotify linked only
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCurrentPage(1);
                setViewMode("all");
                router.replace(pathname);
              }}
              className="rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-white transition-all hover:border-white/20 hover:bg-white/5"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

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

  function updateParam(key: string, value: string) {
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(key, value);
    else params.delete(key);

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }
}

function getArtistRecommendationScore(
  artist: Artist,
  followedArtistIds: Set<number>,
  preferredGenres: Set<string>
) {
  let score = 0;

  if (followedArtistIds.has(artist.artist_id)) {
    score += 10;
  }

  artist.genres?.forEach((genre) => {
    if (preferredGenres.has(genre.toLowerCase())) {
      score += 3;
    }
  });

  if (artist.spotify_link) score += 1;
  if (artist.popularity) score += artist.popularity / 25;

  return score;
}
