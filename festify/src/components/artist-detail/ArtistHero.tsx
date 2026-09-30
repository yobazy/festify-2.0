import Image from "next/image";
import { FollowArtistButton } from "@/components/taste/FollowArtistButton";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { Artist } from "@/types/artist";

interface ArtistHeroProps {
  artist: Artist;
}

/** The artist's own front page: full-bleed photo, name set like a poster. */
export function ArtistHero({ artist }: ArtistHeroProps) {
  const genres = artist.genres?.slice(0, 4) ?? [];

  return (
    <section className="relative min-h-[72svh] overflow-hidden border-b border-line bg-ink-2">
      <Image
        src={artist.img_url || PLACEHOLDER_IMAGE}
        alt=""
        fill
        priority
        sizes="100vw"
        className="img-poster object-cover"
      />
      <div className="scrim-left absolute inset-0 hidden md:block" />
      <div className="scrim-bottom absolute inset-0" />

      <div className="page relative flex min-h-[72svh] flex-col justify-end pb-10 pt-24 sm:pb-14">
        {(genres.length > 0 || artist.popularity !== null) && (
          <p className="meta-strong mb-6 flex flex-wrap gap-x-6 gap-y-1">
            {genres.map((genre) => (
              <span key={genre}>{genre}</span>
            ))}
            {artist.popularity !== null && (
              <span className="text-smoke">Popularity {artist.popularity}</span>
            )}
          </p>
        )}

        <h1 className="display max-w-[12ch] text-[clamp(3rem,10vw,9rem)] text-paper">
          {artist.artist_name}
        </h1>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <FollowArtistButton artist={artist} />
          {artist.spotify_link && (
            <a
              href={artist.spotify_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-paper-2 underline-offset-4 hover:text-paper hover:underline"
            >
              Open in Spotify
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
