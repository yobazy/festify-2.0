import Link from "next/link";
import Image from "next/image";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { FollowArtistButton } from "@/components/taste/FollowArtistButton";
import type { Artist } from "@/types/artist";

interface ArtistCardProps {
  artist: Artist;
}

/** Artist tile: square photo, name and first two genres set below. */
export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <article className="group relative bg-ink">
      <Link
        href={`/artists/${artist.artist_id}`}
        className="absolute inset-0 z-10"
        aria-label={artist.artist_name}
      />
      <div className="relative aspect-square overflow-hidden bg-ink-3">
        <Image
          src={artist.img_url || PLACEHOLDER_IMAGE}
          alt=""
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="img-poster object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute right-3 top-3 z-20">
          <FollowArtistButton artist={artist} compact className="bg-ink/60 backdrop-blur-[2px]" />
        </div>
        {artist.popularity !== null && (
          <span className="meta pointer-events-none absolute bottom-3 right-3 z-20 bg-ink/60 px-1.5 py-0.5 text-paper">
            {artist.popularity}
          </span>
        )}
      </div>
      <div className="pointer-events-none p-3 pb-4">
        <h3 className="display-narrow text-xl text-paper transition-colors group-hover:text-signal">
          {artist.artist_name}
        </h3>
        {artist.genres && artist.genres.length > 0 && (
          <p className="meta mt-1 truncate">{artist.genres.slice(0, 2).join(", ")}</p>
        )}
      </div>
    </article>
  );
}
