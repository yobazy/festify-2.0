import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ExternalLink, MapPin, Music2 } from "lucide-react";
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
import type { Artist } from "@/types/artist";
import type { Event } from "@/types/event";
import type { SavedPlaylist, SpotifyPlaylist } from "@/types/playlist";

export const metadata: Metadata = {
  title: "Festify | Playlists",
  description:
    "Discover playlist spotlights for the strongest upcoming events, then save the ones you want to revisit.",
};

export default async function PlaylistsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const today = new Date().toISOString().split("T")[0];
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
    .gte("event_date", today)
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <section className="space-y-6">
        <div className="glass rounded-3xl border border-white/5 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-primary/80">
                Playlist discovery
              </p>
              <h1 className="mt-3 font-brand text-4xl text-white">Playlists</h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                Start with the events pulling the strongest lineups right now.
                We rank them from artist popularity, lineup depth, festival
                weight, and how soon they land.
              </p>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
                Ranked now
              </p>
              <p className="mt-1">{spotlightEvents.length} spotlight event{spotlightEvents.length === 1 ? "" : "s"}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass rounded-3xl border border-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
              How it works
            </p>
            <h2 className="mt-2 text-lg font-medium text-white">
              Ranked for discovery
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              This page is not your settings library anymore. It is a discovery
              feed that surfaces playlists for the events with the strongest
              upcoming lineups.
            </p>
            <Link
              href="/events"
              className="mt-4 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              Browse all events
            </Link>
          </div>

          <div className="glass rounded-3xl border border-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
              Your library
            </p>
            <h2 className="mt-2 text-lg font-medium text-white">
              {user ? "Saved playlists still live here" : "Sign in to save playlists"}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {user
                ? spotifyConnection
                  ? `Your saved playlists stay in Festify and new saves also follow in Spotify as ${spotifyConnection.spotify_display_name ?? "your account"}.`
                  : "Your saved playlists stay in Festify. Connect Spotify if you want new saves to follow there too."
                : "You can browse this page without an account, then sign in when you want to save playlists from artist pages."}
            </p>
            <Link
              href={user ? "/settings/music" : "/auth/login?next=%2Fplaylists"}
              className="mt-4 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              {user ? "Manage music settings" : "Sign in"}
            </Link>
          </div>
        </div>

        <div className="glass rounded-3xl border border-white/5 p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Music2 size={20} className="text-primary" />
                <h2 className="text-lg font-medium text-white">Popular right now</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Playlist spotlights for the highest-ranked upcoming events.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              View events
            </Link>
          </div>

          {spotlightEvents.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/5 px-6 py-10 text-center">
              <p className="text-lg font-medium text-white">No playlist spotlights yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Once upcoming events and lineups are available, this page will
                rank them and pull in matching playlists.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {spotlightEvents.map(({ event, playlists }) => (
                <article
                  key={event.event_id}
                  className="overflow-hidden rounded-3xl border border-white/5 bg-white/5"
                >
                  <div className="relative h-56">
                    <Image
                      src={normalizeImageUrl(event.use_alt ? event.alt_img : event.img_url) ?? PLACEHOLDER_IMAGE}
                      alt={event.event_name}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover opacity-45"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full bg-primary/85 px-3 py-1 text-xs font-medium text-black">
                      {event.popularity_tier ??
                        getEventPopularityTier(getEventPopularityScore(event))}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={12} />
                          {formatDate(event.event_date)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={12} />
                          {getEventLocationLabel(event) ?? "Location TBA"}
                        </span>
                      </div>
                      <h3 className="mt-3 font-brand text-2xl text-white">
                        {event.event_name}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {getTopArtistLabel(event)}
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
                        Playlist spotlights
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Score {getEventPopularityScore(event)}
                      </p>
                    </div>

                    {playlists.length === 0 ? (
                      <p className="mt-4 text-sm text-muted-foreground">
                        No playlist match yet. Open the event page to explore the
                        lineup and try related artists instead.
                      </p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {playlists.map((playlist) => (
                          <a
                            key={playlist.id}
                            href={playlist.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/20 p-3 transition-colors hover:border-white/10 hover:bg-black/30"
                          >
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/5">
                              <Image
                                src={playlist.images?.[0]?.url ?? PLACEHOLDER_IMAGE}
                                alt={playlist.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-white">
                                {playlist.name}
                              </p>
                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {playlist.owner.display_name || "Spotify playlist"}
                              </p>
                              {playlist.description ? (
                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                  {sanitizeDescription(playlist.description)}
                                </p>
                              ) : null}
                            </div>
                            <ExternalLink size={14} className="shrink-0 text-muted-foreground" />
                          </a>
                        ))}
                      </div>
                    )}

                    <Link
                      href={`/events/${event.event_id}`}
                      className="mt-5 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
                    >
                      Open event
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-3xl border border-white/5 p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Music2 size={20} className="text-primary" />
                <h2 className="text-lg font-medium text-white">Saved playlists</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Your personal save list stays here, just lower on the page.
              </p>
            </div>
            {!user ? (
              <Link
                href="/auth/login?next=%2Fplaylists"
                className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
              >
                Sign in to save
              </Link>
            ) : null}
          </div>

          {!user ? (
            <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/5 px-6 py-10 text-center">
              <p className="text-lg font-medium text-white">
                Sign in when you want your own library
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                You can browse discovery playlists without an account. Saving
                happens from artist pages once you sign in.
              </p>
            </div>
          ) : savedPlaylists.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/5 px-6 py-10 text-center">
              <p className="text-lg font-medium text-white">No saved playlists yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Open an artist page, hit Save on a playlist that fits, and it
                will show up here.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {savedPlaylists.map((playlist) => (
                <a
                  key={playlist.id}
                  href={playlist.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-3xl border border-white/5 bg-white/5 p-4 transition-colors hover:border-white/10 hover:bg-white/8"
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-white/5">
                    <Image
                      src={playlist.image_url ?? PLACEHOLDER_IMAGE}
                      alt={playlist.name}
                      fill
                      sizes="(min-width: 1280px) 320px, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="mt-4">
                    <p className="line-clamp-2 text-sm font-medium text-white">
                      {playlist.name}
                    </p>
                    <p className="mt-1 truncate text-xs uppercase tracking-[0.18em] text-primary/80">
                      {playlist.owner_name ?? "Spotify playlist"}
                    </p>
                    {playlist.description ? (
                      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                        {playlist.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{playlist.track_total} tracks</span>
                    {playlist.artist_name ? <span>From {playlist.artist_name}</span> : null}
                    <span>Saved {formatDate(playlist.created_at)}</span>
                  </div>

                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white">
                    <ExternalLink size={14} />
                    <span>Open in Spotify</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function dedupePlaylists(playlists: SpotifyPlaylist[]) {
  return playlists.filter(
    (playlist, index, list) =>
      list.findIndex((entry) => entry.id === playlist.id) === index
  );
}

function getTopArtistLabel(event: Event) {
  const topArtists = [...(event.artists ?? [])]
    .sort((a, b) => (b.popularity ?? -1) - (a.popularity ?? -1))
    .slice(0, 3)
    .map((artist) => artist.artist_name);

  if (topArtists.length === 0) {
    return "Ranking still works without artist popularity, but lineup data will sharpen this card over time.";
  }

  return `Top names: ${topArtists.join(", ")}.`;
}

function sanitizeDescription(value: string | null) {
  if (!value) return null;
  return value.replace(/<[^>]+>/g, "").trim();
}

function normalizeImageUrl(url: string | null) {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  const raPrefix = "https://images.ra.co/";
  if (trimmed.startsWith(raPrefix + "https://")) {
    return trimmed.slice(raPrefix.length);
  }

  return trimmed;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
