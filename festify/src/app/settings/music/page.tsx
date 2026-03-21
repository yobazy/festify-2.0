import Image from "next/image";
import Link from "next/link";
import { disconnectSpotify } from "@/app/settings/actions";
import { requireUser } from "@/lib/auth";
import { hasAdminCredentials } from "@/lib/supabase/admin";
import { getSpotifyConnection } from "@/lib/spotify-server";

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
  const spotifyConnection = await getSpotifyConnection(user.id);

  return (
    <section className="space-y-6">
      <div className="glass rounded-3xl border border-white/5 p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="font-brand text-2xl text-white">Music</h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Connect Spotify so playlists you save from artist pages can follow
              there too.
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
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10">
              <Image
                src={spotifyConnection.spotify_avatar_url}
                alt="Spotify profile avatar"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {!spotifySyncAvailable
            ? "Spotify OAuth is disabled until the server-side Supabase service key is available in the app environment."
            : spotifyConnection
            ? `Connected as ${spotifyConnection.spotify_display_name ?? "your Spotify account"}.`
            : "Connect Spotify to follow future playlist saves from Festify."}
        </p>

        <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
            Playlist library
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Saved playlists now live on the dedicated Playlists page.
          </p>
          <Link
            href="/playlists"
            className="mt-4 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
          >
            Open playlists
          </Link>
        </div>
      </div>
    </section>
  );
}
