import Image from "next/image";
import Link from "next/link";
import { disconnectSpotify } from "@/app/settings/actions";
import { requireUser } from "@/lib/auth";
import { hasAdminCredentials } from "@/lib/supabase/admin";
import {
  getSpotifyConnection,
  listSavedPlaylistsForUser,
} from "@/lib/spotify-server";

interface MusicSettingsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getStatusMessage(status: string | null) {
  switch (status) {
    case "connected":
      return "Spotify is connected. New playlist saves will follow there too.";
    case "disconnected":
      return "Spotify has been disconnected. Your Festify library is still here.";
    case "error":
      return "Spotify connection did not complete. Please try again.";
    case "setup-required":
      return "Add SUPABASE_SERVICE_KEY to festify/.env.local before enabling Spotify sync.";
    default:
      return null;
  }
}

export default async function MusicSettingsPage({
  searchParams,
}: MusicSettingsPageProps) {
  const user = await requireUser();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const spotifyStatus = Array.isArray(resolvedSearchParams?.spotify)
    ? resolvedSearchParams?.spotify[0]
    : resolvedSearchParams?.spotify ?? null;
  const message = getStatusMessage(spotifyStatus);
  const spotifySyncAvailable = hasAdminCredentials();
  const [spotifyConnection, savedPlaylists] = await Promise.all([
    getSpotifyConnection(user.id),
    listSavedPlaylistsForUser(user.id),
  ]);

  return (
    <section className="space-y-6">
      <div className="glass rounded-3xl border border-white/5 p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="font-brand text-2xl text-white">Music</h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Connect Spotify to mirror saved playlists there, or just keep a
              Festify library you can return to later.
            </p>
          </div>

          {spotifyConnection ? (
            <form action={disconnectSpotify}>
              <button
                type="submit"
                className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
              >
                Disconnect Spotify
              </button>
            </form>
          ) : !spotifySyncAvailable ? (
            <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-5 py-2.5 text-sm font-medium text-amber-200">
              Spotify sync needs server setup
            </div>
          ) : (
            <Link
              href="/api/spotify/connect"
              className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-500"
            >
              Connect Spotify
            </Link>
          )}
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
            {message}
          </div>
        )}
      </div>

      <div className="glass rounded-3xl border border-white/5 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
              Spotify sync
            </p>
            <h3 className="mt-2 text-lg font-medium text-white">
              {spotifyConnection ? "Connected" : "Not connected"}
            </h3>
          </div>

          {spotifyConnection && spotifyConnection.spotify_avatar_url ? (
            <div className="h-12 w-12 overflow-hidden rounded-full border border-white/10">
              <img
                src={spotifyConnection.spotify_avatar_url}
                alt="Spotify profile avatar"
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {!spotifySyncAvailable
            ? "Spotify OAuth is disabled until the server-side Supabase service key is available in the app environment."
            : spotifyConnection
            ? `Connected as ${spotifyConnection.spotify_display_name ?? "your Spotify account"}.`
            : "Saved playlists stay inside Festify until you connect Spotify."}
        </p>
      </div>

      <div className="glass rounded-3xl border border-white/5 p-6 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
              Festify library
            </p>
            <h3 className="mt-2 text-lg font-medium text-white">
              Saved playlists
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {savedPlaylists.length} playlist{savedPlaylists.length === 1 ? "" : "s"}
          </p>
        </div>

        {savedPlaylists.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Nothing here yet. Save a playlist from any artist page to start your
            library.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {savedPlaylists.map((playlist) => (
              <a
                key={playlist.id}
                href={playlist.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-3xl border border-white/5 bg-white/5 p-4 transition-colors hover:border-white/10 hover:bg-white/8"
              >
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/5">
                    {playlist.image_url ? (
                      <Image
                        src={playlist.image_url}
                        alt={playlist.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {playlist.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {playlist.owner_name ?? "Spotify playlist"}
                    </p>
                    {playlist.artist_name ? (
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-primary/80">
                        From {playlist.artist_name}
                      </p>
                    ) : null}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
