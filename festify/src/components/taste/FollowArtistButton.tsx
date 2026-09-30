"use client";

import { Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasteStore } from "@/stores/tasteStore";
import type { Artist } from "@/types/artist";

interface FollowArtistButtonProps {
  artist: Artist;
  className?: string;
  /** Icon-only, for grids. */
  compact?: boolean;
}

export function FollowArtistButton({
  artist,
  className,
  compact = false,
}: FollowArtistButtonProps) {
  const followedArtists = useTasteStore((state) => state.followedArtists);
  const toggleFollowArtist = useTasteStore((state) => state.toggleFollowArtist);

  const isFollowed = followedArtists.some(
    (entry) => entry.artist_id === artist.artist_id
  );

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFollowArtist(artist);
      }}
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium transition-[background-color,color,border-color,transform] active:scale-95",
        compact ? "h-9 w-9 justify-center" : "h-10 px-4",
        isFollowed
          ? "bg-paper text-ink"
          : "border border-line-strong text-paper hover:border-paper hover:bg-ink-2",
        className
      )}
      aria-pressed={isFollowed}
      aria-label={isFollowed ? `Unfollow ${artist.artist_name}` : `Follow ${artist.artist_name}`}
      title={isFollowed ? "Following" : "Follow"}
    >
      {isFollowed ? <Check size={14} /> : <Plus size={14} />}
      {!compact && (isFollowed ? "Following" : "Follow")}
    </button>
  );
}
