import Link from "next/link";
import { disconnectSpotify } from "@/app/settings/actions";
import { requireUser } from "@/lib/auth";
import { hasAdminCredentials } from "@/lib/supabase/admin";
import { getSpotifyConnection } from "@/lib/spotify-server";
import { Button } from "@/components/ui/Button";

interface MusicSettingsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getStatusMessage(status: string | null) {
  switch (status) {
    case "connected":
      return "Spotify connected. New saves will follow there too.";
    case "disconnected":
      return "Spotify disconnected. Your saved playlists are still on the Playlists page.";
    case "error":
      return "Spotify connection didn't complete. Try again.";
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
    <section>
      {message && (
        <div className="mb-8 border border-line px-4 py-3 text-sm text-paper">{message}</div>
      )}

      <div className="grid gap-4 border-b border-line py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="flex items-center gap-4">
          {spotifyConnection?.spotify_avatar_url && (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-ink-3">
              {/* Spotify avatars come from arbitrary CDN hosts (fbcdn etc.), so
                  next/image's remotePatterns can't cover them. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={spotifyConnection.spotify_avatar_url}
                alt=""
                width={40}
                height={40}
                className="img-poster h-full w-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="display-narrow text-2xl text-paper">Spotify</h2>
            <p className="meta mt-1 truncate">
              {spotifyConnection
                ? `Connected as ${spotifyConnection.spotify_display_name ?? "your Spotify account"}`
                : "Not connected"}
            </p>
          </div>
        </div>

        <div className="sm:text-right">
          {spotifyConnection ? (
            <form action={disconnectSpotify}>
              <Button type="submit" variant="outline">
                Disconnect Spotify
              </Button>
            </form>
          ) : !spotifySyncAvailable ? (
            <p className="max-w-sm text-sm text-smoke">
              Spotify sync needs a server setup: add SUPABASE_SERVICE_KEY to festify/.env.local.
            </p>
          ) : (
            <Link
              href="/api/spotify/connect"
              className="inline-flex h-10 items-center bg-paper px-4 text-sm font-medium text-ink hover:bg-white"
            >
              Connect Spotify
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-2 border-b border-line py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div>
          <h2 className="display-narrow text-2xl text-paper">Library</h2>
          <p className="mt-1 text-sm text-smoke">Saved playlists live on the Playlists page.</p>
        </div>
        <Link
          href="/playlists"
          className="meta-strong underline-offset-4 hover:underline sm:text-right"
        >
          Open playlists
        </Link>
      </div>
    </section>
  );
}
