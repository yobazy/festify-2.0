"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import { SectionHead } from "@/components/ui/SectionHead";
import { Button } from "@/components/ui/Button";
import { SpotifyEmbed } from "@/components/event-detail/SpotifyEmbed";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { searchPlaylists } from "@/lib/spotify";
import type { Artist } from "@/types/artist";
import type { SpotifyPlaylist } from "@/types/playlist";

interface ArtistPlaylistsProps {
  artist: Artist;
  isSignedIn: boolean;
}

interface AccountState {
  connected: boolean;
  savedPlaylistIds: string[];
}

const gridClass = "tile-grid grid-cols-2  md:grid-cols-3 xl:grid-cols-4";

function sanitizeDescription(value: string | null) {
  if (!value) return null;

  return value.replace(/<[^>]+>/g, "").trim();
}

/** Playlists that lead with this artist. Tap a cover to play it here. */
export function ArtistPlaylists({ artist, isSignedIn }: ArtistPlaylistsProps) {
  const pathname = usePathname();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null);
  const [accountState, setAccountState] = useState<AccountState>({
    connected: false,
    savedPlaylistIds: [],
  });
  const [busyPlaylistId, setBusyPlaylistId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPlaylists() {
      try {
        const results = await searchPlaylists(artist.artist_name, {
          appendFestival: false,
          limit: 12,
        });

        if (!cancelled) {
          const deduped = results.filter(
            (playlist, index, array) =>
              array.findIndex((entry) => entry.id === playlist.id) === index
          );
          setPlaylists(deduped);
        }
      } catch (loadError) {
        console.error("Failed to load artist playlists", loadError);
        if (!cancelled) {
          setPlaylists([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPlaylists();

    return () => {
      cancelled = true;
    };
  }, [artist.artist_name]);

  useEffect(() => {
    let cancelled = false;

    async function loadAccountState() {
      if (!isSignedIn) return;

      try {
        const response = await fetch("/api/spotify/account");

        if (!response.ok) {
          throw new Error("Failed to fetch account state");
        }

        const data = (await response.json()) as AccountState;

        if (!cancelled) {
          setAccountState({
            connected: data.connected,
            savedPlaylistIds: data.savedPlaylistIds,
          });
        }
      } catch (accountError) {
        console.error("Failed to load Spotify account state", accountError);
      }
    }

    loadAccountState();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  const helperCopy = useMemo(() => {
    if (!isSignedIn) {
      return "Sign in to keep playlists in your library.";
    }

    if (accountState.connected) {
      return "Saved playlists also follow in your Spotify account.";
    }

    return "Saved here now. Connect Spotify in settings to sync future saves.";
  }, [accountState.connected, isSignedIn]);

  if (loading) {
    return (
      <section className="py-14">
        <SectionHead title="Playlists" note={helperCopy} />
        <div className={`mt-6 ${gridClass}`}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-ink">
              <Skeleton className="aspect-square w-full" />
              <div className="p-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
                <Skeleton className="mt-4 h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (playlists.length === 0) return null;

  async function toggleSave(playlist: SpotifyPlaylist, isSaved: boolean) {
    if (!isSignedIn) return;

    try {
      setBusyPlaylistId(playlist.id);
      setMessage(null);

      const response = await fetch(`/api/spotify/playlists/${playlist.id}`, {
        method: isSaved ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: isSaved
          ? undefined
          : JSON.stringify({
              name: playlist.name,
              description: sanitizeDescription(playlist.description),
              imageUrl: playlist.images?.[0]?.url ?? null,
              spotifyUrl: playlist.external_urls.spotify,
              ownerName: playlist.owner.display_name,
              trackTotal: playlist.tracks.total,
              artistName: artist.artist_name,
            }),
      });

      const data = (await response.json()) as {
        error?: string;
        spotifyConnected?: boolean;
        spotifySynced?: boolean;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update saved playlists");
      }

      setAccountState((current) => ({
        connected: data.spotifyConnected ?? current.connected,
        savedPlaylistIds: isSaved
          ? current.savedPlaylistIds.filter((id) => id !== playlist.id)
          : [...current.savedPlaylistIds, playlist.id],
      }));

      if (isSaved) {
        setMessage(
          data.spotifyConnected
            ? "Removed from your library and unfollowed in Spotify."
            : "Removed from your library."
        );
      } else if (data.spotifyConnected && data.spotifySynced) {
        setMessage("Saved. It also follows in Spotify.");
      } else if (data.spotifyConnected) {
        setMessage("Saved. Spotify sync is unavailable right now.");
      } else {
        setMessage("Saved. Connect Spotify in settings to sync future saves.");
      }
    } catch (saveError) {
      console.error("Failed to toggle playlist save", saveError);
      setMessage("Couldn't update that playlist. Try again.");
    } finally {
      setBusyPlaylistId(null);
    }
  }

  return (
    <section className="py-14">
      <SectionHead title="Playlists" note={helperCopy} />

      {message && (
        <div
          role="status"
          className="mt-6 border border-line px-4 py-3 text-sm text-paper"
        >
          {message}
        </div>
      )}

      <div className={`mt-6 ${gridClass}`}>
        {playlists.map((playlist) => {
          const isSaved = accountState.savedPlaylistIds.includes(playlist.id);
          const isBusy = busyPlaylistId === playlist.id;
          const isActive = activePlaylist === playlist.id;
          const owner = playlist.owner.display_name || "Spotify";

          return (
            <article key={playlist.id} className="flex flex-col bg-ink">
              <button
                type="button"
                onClick={() => setActivePlaylist(isActive ? null : playlist.id)}
                aria-pressed={isActive}
                aria-label={isActive ? `Close ${playlist.name}` : `Play ${playlist.name}`}
                className="group relative block aspect-square w-full overflow-hidden bg-ink-3 text-left"
              >
                <Image
                  src={playlist.images?.[0]?.url ?? PLACEHOLDER_IMAGE}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className="img-poster object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                {isActive && (
                  <>
                    <div className="scrim-bottom absolute inset-0" />
                    <span className="live-bars absolute bottom-3 left-3">
                      <span />
                      <span />
                      <span />
                    </span>
                  </>
                )}
              </button>

              <div className="flex flex-1 flex-col p-3">
                <p className="line-clamp-2 text-sm text-paper">{playlist.name}</p>
                <p className="meta mt-1 truncate">{owner}</p>
                <p className="meta">
                  {playlist.tracks.total} {playlist.tracks.total === 1 ? "track" : "tracks"}
                </p>

                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
                  {isSignedIn ? (
                    <Button
                      size="sm"
                      variant={isSaved ? "solid" : "outline"}
                      onClick={() => toggleSave(playlist, isSaved)}
                      disabled={isBusy}
                      aria-pressed={isSaved}
                    >
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                  ) : (
                    <Link
                      href={`/auth/login?next=${encodeURIComponent(pathname || "/artists")}`}
                      className="meta-strong underline-offset-4 hover:underline"
                    >
                      Sign in to save
                    </Link>
                  )}

                  <a
                    href={playlist.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="meta-strong underline-offset-4 hover:underline"
                  >
                    Open in Spotify
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {activePlaylist && (
        <div className="mt-6">
          <SpotifyEmbed playlistId={activePlaylist} />
        </div>
      )}
    </section>
  );
}
