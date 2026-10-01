"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArtistCard } from "./ArtistCard";
import { ArtistFilters, type ArtistSort, type ArtistViewMode } from "./ArtistFilters";
import { Button } from "@/components/ui/Button";
import { useDebounce } from "@/hooks/useDebounce";
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
  const [viewMode, setViewMode] = useState<ArtistViewMode>("all");
  const debouncedQuery = useDebounce(query);
  const followedArtists = useTasteStore((state) => state.followedArtists);
  const preferredGenres = useTasteStore((state) => state.preferredGenres);

  const genre = searchParams.get("genre") ?? "";
  const sort: ArtistSort = searchParams.get("sort") === "name" ? "name" : "popular";
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
    const followedIds = new Set(followedArtists.map((artist) => artist.artist_id));
    const normalizedPreferredGenres = new Set(
      preferredGenres.map((entry) => entry.toLowerCase())
    );

    const nextArtists = artists.filter((artist) => {
      const matchesQuery = q ? artist.artist_name.toLowerCase().includes(q) : true;
      const matchesGenre = genre
        ? (artist.genres?.some(
            (artistGenre) => artistGenre.toLowerCase() === genre.toLowerCase()
          ) ?? false)
        : true;
      const matchesSpotify = spotifyOnly ? Boolean(artist.spotify_link) : true;
      const matchesViewMode =
        viewMode === "all"
          ? true
          : viewMode === "following"
            ? followedIds.has(artist.artist_id)
            : getArtistRecommendationScore(artist, followedIds, normalizedPreferredGenres) > 0;

      return matchesQuery && matchesGenre && matchesSpotify && matchesViewMode;
    });

    return nextArtists.sort((a, b) => {
      if (viewMode === "recommended") {
        return (
          getArtistRecommendationScore(b, followedIds, normalizedPreferredGenres) -
            getArtistRecommendationScore(a, followedIds, normalizedPreferredGenres) ||
          a.artist_name.localeCompare(b.artist_name)
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

  const hasTasteProfile = followedArtists.length > 0 || preferredGenres.length > 0;
  const hasActiveFilters = Boolean(genre || spotifyOnly || query || viewMode !== "all");

  return (
    <div>
      <ArtistFilters
        query={query}
        onQueryChange={(value) => {
          setQuery(value);
          setCurrentPage(1);
        }}
        sort={sort}
        onSortChange={(value) => updateParam("sort", value === "popular" ? "" : value)}
        genre={genre}
        genreOptions={topGenres}
        onGenreChange={(value) => updateParam("genre", value)}
        spotifyOnly={spotifyOnly}
        onSpotifyOnlyChange={(next) => updateParam("spotify", next ? "1" : "")}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setCurrentPage(1);
          setViewMode(mode);
        }}
        hasTasteProfile={hasTasteProfile}
        totalResults={filtered.length}
        hasActiveFilters={hasActiveFilters}
        onReset={() => {
          setQuery("");
          setCurrentPage(1);
          setViewMode("all");
          router.replace(pathname);
        }}
      />

      {paginated.length > 0 && (
        <div className="mt-8 tile-grid grid-cols-2  sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {paginated.map((artist) => (
            <ArtistCard key={artist.artist_id} artist={artist} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="border-b border-line py-20 text-center">
          <p className="display text-3xl text-paper">No one by that name</p>
          <p className="mt-3 text-sm text-smoke">Not on an upcoming bill, or spelled with more vowels than you remember. Try fewer letters or clear the genre.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
            )
            .map((page, i, arr) => (
              <span key={page} className="flex items-center">
                {i > 0 && arr[i - 1] !== page - 1 && <span className="meta px-1">…</span>}
                <Button
                  variant={page === currentPage ? "solid" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="min-w-[36px] font-mono"
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </Button>
              </span>
            ))}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
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
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
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
