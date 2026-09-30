import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import {
  attachArtistsToEvents,
  getEventLocationLabel,
  getEventPopularityScore,
  getEventPopularityTier,
  sortEventsByPopularity,
} from "@/lib/event-data";
import {
  getSpotifyConnection,
  listSavedPlaylistsForUser,
  searchPlaylistsForQuery,
} from "@/lib/spotify-server";
import { Billing } from "@/components/events/Billing";
import { PlayLineupLink } from "@/components/events/PlayLineupLink";
import { SectionHead } from "@/components/ui/SectionHead";
import type { Artist } from "@/types/artist";
import type { Event } from "@/types/event";
import type { SavedPlaylist, SpotifyPlaylist } from "@/types/playlist";
import {
  formatEventDate,
  getTodayDateString,
  upcomingEventsFilter,
} from "@/lib/dates";

export const metadata: Metadata = {
  title: "Playlists",
  description:
    "Every lineup, as a playlist. Upcoming bills ranked by headliner, support and depth, with the playlists to match.",
};

export default async function PlaylistsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const today = getTodayDateString();
  const userContext: [
    Awaited<ReturnType<typeof getSpotifyConnection>>,
    SavedPlaylist[],
  ] = user
    ? await Promise.all([
        getSpotifyConnection(user.id),
        listSavedPlaylistsForUser(user.id),
      ])
    : [null, []];

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .or(upcomingEventsFilter(today))
    .order("popularity_score", { ascending: false, nullsFirst: false })
    .order("event_date", { ascending: true })
    .limit(24);

  if (eventsError) {
    throw eventsError;
  }

  const eventIds = ((events as Event[] | null) ?? []).map((event) => event.event_id);
  const { data: gigs, error: gigsError } = eventIds.length
    ? await supabase
        .from("gigs")
        .select("event_id, artists(*)")
        .in("event_id", eventIds)
    : { data: null, error: null };

  if (gigsError) {
    throw gigsError;
  }

  const [spotifyConnection, savedPlaylists] = userContext;
  const rankedEvents = sortEventsByPopularity(
    attachArtistsToEvents(
      (events as Event[]) ?? [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (gigs as any[] | null)?.map((gig) => ({
        event_id: gig.event_id,
        artists: gig.artists as Artist | null,
      })) ?? null
    )
  ).slice(0, 6);

  const spotlightEvents = await Promise.all(
    rankedEvents.map(async (event) => {
      try {
        const playlists = dedupePlaylists(
          await searchPlaylistsForQuery(event.event_name, { limit: 3 })
        );

        return { event, playlists };
      } catch (error) {
        console.error("Failed to load spotlight playlists", error);
        return { event, playlists: [] as SpotifyPlaylist[] };
      }
    })
  );

  const libraryNote = !user
    ? "Saved playlists live here once you sign in."
    : spotifyConnection
      ? `Saves also follow in Spotify as ${spotifyConnection.spotify_display_name ?? "your account"}.`
      : "Saves stay here. Connect Spotify in settings to sync them too.";

  const libraryAside = user
    ? { href: "/settings/music", label: "Music settings" }
    : { href: "/auth/login?next=%2Fplaylists", label: "Sign in" };

  return (
    <div className="page pb-16 pt-10 sm:pt-14">
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="display text-6xl text-paper sm:text-8xl">Playlists</h1>
        <p className="meta-strong sm:text-right">
          <span className="block">
            {spotlightEvents.length} {spotlightEvents.length === 1 ? "bill" : "bills"} ranked
          </span>
          <span className="block text-smoke">by headliner, support and depth</span>
        </p>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-4">
        <p className="meta">
          Every lineup, as a playlist. Ranked by the strength of the whole bill.
        </p>
        {!user && (
          <Link
            href="/auth/login?next=%2Fplaylists"
            className="meta-strong underline-offset-4 hover:underline"
          >
            Sign in to keep a library
          </Link>
        )}
      </div>

      <section className="py-14">
        <SectionHead
          title="On the bill this season"
          aside={{ href: "/events", label: "All shows" }}
        />

        {spotlightEvents.length === 0 ? (
          <div className="pt-8">
            <p className="display text-3xl text-paper">Nothing ranked yet</p>
            <p className="mt-3 max-w-md text-sm text-smoke">
              Shows sync from EDMTrain and Resident Advisor. Check back shortly.
            </p>
          </div>
        ) : (
          <div>
            {spotlightEvents.map(({ event, playlists }) => (
              <Spotlight key={event.event_id} event={event} playlists={playlists} />
            ))}
          </div>
        )}
      </section>

      <section className="py-14">
        <SectionHead title="Your library" note={libraryNote} aside={libraryAside} />

        {!user ? (
          <p className="pt-8 text-sm text-smoke">
            Browse without an account. Sign in when you want to save.
          </p>
        ) : savedPlaylists.length === 0 ? (
          <p className="pt-8 text-sm text-smoke">
            Nothing saved yet. Save a playlist from any artist page.
          </p>
        ) : (
          <div className="mt-8 tile-grid grid-cols-2  md:grid-cols-3 xl:grid-cols-4">
            {savedPlaylists.map((playlist) => (
              <SavedTile key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Spotlight({
  event,
  playlists,
}: {
  event: Event;
  playlists: SpotifyPlaylist[];
}) {
  const location = getEventLocationLabel(event);
  const score = getEventPopularityScore(event);
  const tier = event.popularity_tier ?? getEventPopularityTier(score);

  return (
    <article className="grid gap-x-10 gap-y-4 border-b border-line py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="min-w-0">
        <p className="meta-strong leading-tight">
          <span className="block">
            {formatEventDate(event.event_date, {
              weekday: "short",
              day: "2-digit",
              month: "short",
            })}
          </span>
          {location && <span className="block text-smoke">{location}</span>}
        </p>

        <h3 className="display mt-3 text-3xl text-paper sm:text-4xl">
          <Link
            href={`/events/${event.event_id}`}
            className="transition-colors hover:text-signal"
          >
            {event.event_name}
          </Link>
        </h3>

        <div className="mt-3">
          <Billing artists={event.artists} variant="inline" maxRest={0} />
        </div>

        <p className="meta mt-3">
          <span>{tier}</span>
          <span className="block">Score {score}</span>
        </p>

        <div className="mt-5">
          <PlayLineupLink eventId={event.event_id} label="Hear it" />
        </div>
      </div>

      <div className="min-w-0">
        {playlists.length === 0 ? (
          <div className="py-3">
            <p className="text-sm text-smoke">No playlist matched this bill yet.</p>
            <Link
              href={`/events/${event.event_id}`}
              className="meta-strong mt-2 inline-block underline-offset-4 hover:underline"
            >
              See the bill
            </Link>
          </div>
        ) : (
          playlists.slice(0, 3).map((playlist) => (
            <a
              key={playlist.id}
              href={playlist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-x-4 border-b border-line py-3 last:border-0"
            >
              <div className="relative h-14 w-14 overflow-hidden bg-ink-3">
                <Image
                  src={playlist.images?.[0]?.url ?? PLACEHOLDER_IMAGE}
                  alt=""
                  fill
                  sizes="56px"
                  className="img-poster object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm text-paper transition-colors group-hover:text-signal">
                  {playlist.name}
                </p>
                <p className="meta mt-0.5 truncate">
                  {playlist.owner.display_name || "Spotify"}
                  {typeof playlist.tracks?.total === "number" && (
                    <span className="block">
                      {playlist.tracks.total} {playlist.tracks.total === 1 ? "track" : "tracks"}
                    </span>
                  )}
                </p>
              </div>
              <span className="meta-strong shrink-0 underline-offset-4 group-hover:underline">
                Open in Spotify
              </span>
            </a>
          ))
        )}
      </div>
    </article>
  );
}

function SavedTile({ playlist }: { playlist: SavedPlaylist }) {
  return (
    <a
      href={playlist.spotify_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-ink"
      aria-label={`${playlist.name}, open in Spotify`}
    >
      <div className="relative aspect-square overflow-hidden bg-ink-3">
        <Image
          src={playlist.image_url ?? PLACEHOLDER_IMAGE}
          alt=""
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="img-poster object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-sm text-paper transition-colors group-hover:text-signal">
          {playlist.name}
        </p>
        <p className="meta mt-1">
          <span className="block truncate">{playlist.owner_name ?? "Spotify"}</span>
          <span className="block">
            {playlist.track_total} {playlist.track_total === 1 ? "track" : "tracks"}
          </span>
          {playlist.artist_name && (
            <span className="block truncate">From {playlist.artist_name}</span>
          )}
          <span className="block">
            Saved{" "}
            {formatEventDate(playlist.created_at, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </p>
      </div>
    </a>
  );
}

function dedupePlaylists(playlists: SpotifyPlaylist[]) {
  return playlists.filter(
    (playlist, index, list) =>
      list.findIndex((entry) => entry.id === playlist.id) === index
  );
}
