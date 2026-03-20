"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasteStore } from "@/stores/tasteStore";
import type { Artist } from "@/types/artist";

interface FollowArtistButtonProps {
  artist: Artist;
  className?: string;
}

export function FollowArtistButton({
  artist,
  className,
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
        "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-all",
        isFollowed
          ? "bg-primary text-black"
          : "bg-black/50 text-white hover:bg-black/65",
        className
      )}
      aria-pressed={isFollowed}
    >
      <Heart size={14} className={cn(isFollowed && "fill-current")} />
      {isFollowed ? "Following" : "Follow"}
    </button>
  );
}
