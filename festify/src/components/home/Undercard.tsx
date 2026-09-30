import Link from "next/link";
import Image from "next/image";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { SectionHead } from "@/components/ui/SectionHead";
import { FollowArtistButton } from "@/components/taste/FollowArtistButton";
import type { Artist } from "@/types/artist";

interface UndercardProps {
  artists: Artist[];
}

/** Artists billed below the headliner on upcoming bills: the ones to know first. */
export function Undercard({ artists }: UndercardProps) {
  if (artists.length === 0) return null;

  return (
    <section className="py-14">
      <div className="page">
        <SectionHead
          title="Undercard"
          note="Billed under the headliner on upcoming shows. Get there for the opener."
          aside={{ href: "/artists", label: "All artists" }}
        />
      </div>

      <div className="scrollbar-hide tile-strip mt-6 snap-x snap-mandatory overflow-x-auto pl-4 sm:pl-6 lg:pl-10 [&>*:last-child]:border-r-0">
        {artists.map((artist) => (
          <article
            key={artist.artist_id}
            className="group relative w-52 shrink-0 snap-start bg-ink sm:w-60"
          >
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
                sizes="240px"
                className="img-poster object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute right-3 top-3 z-20">
                <FollowArtistButton artist={artist} compact className="bg-ink/60 backdrop-blur-[2px]" />
              </div>
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
        ))}
        <div className="w-4 shrink-0 bg-ink sm:w-6 lg:w-10" aria-hidden="true" />
      </div>
    </section>
  );
}
