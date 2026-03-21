"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, ExternalLink, Loader2, Music2 } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";
import { SpotifyEmbed } from "@/components/event-detail/SpotifyEmbed";
import { useSpotifyToken } from "@/hooks/useSpotifyToken";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { searchPlaylists } from "@/lib/spotify";
import { cn } from "@/lib/utils";
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

function sanitizeDescription(value: string | null) {
  if (!value) return null;

  return value.replace(/<[^>]+>/g, "").trim();
}

export function ArtistPlaylists({
  artist,
  isSignedIn,
}: ArtistPlaylistsProps) {
  const pathname = usePathname();
  const { token, error } = useSpotifyToken();
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
      if (!token) return;

      try {
        const results = await searchPlaylists(artist.artist_name, token, {
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
  }, [artist.artist_name, token]);

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
      return "Sign in to save playlists to your Festify library.";
    }

    if (accountState.connected) {
      return "Saved playlists stay in Festify and also follow in Spotify.";
    }

    return "Save playlists in Festify now, then connect Spotify later to sync future saves there too.";
  }, [accountState.connected, isSignedIn]);

  if (error) return null;

  if (loading) {
    return (
      <section className="py-10">
        <div className="mb-6 flex items-center gap-2">
          <Music2 size={22} className="text-primary" />
          <h2 className="font-brand text-2xl text-white">Playlists</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-72 rounded-3xl" />
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
            ? "Removed from your Festify library and unfollowed on Spotify."
            : "Removed from your Festify library."
        );
      } else if (data.spotifyConnected && data.spotifySynced) {
        setMessage("Saved in Festify and followed on Spotify.");
      } else if (data.spotifyConnected) {
        setMessage("Saved in Festify. Spotify sync is temporarily unavailable.");
      } else {
        setMessage("Saved in Festify. Connect Spotify in settings to sync future saves.");
      }
    } catch (saveError) {
      console.error("Failed to toggle playlist save", saveError);
      setMessage("We couldn't update this playlist right now. Please try again.");
    } finally {
      setBusyPlaylistId(null);
    }
  }

  return (
    <section className="py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Music2 size={22} className="text-primary" />
            <h2 className="font-brand text-2xl text-white">Playlists</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Spotify playlists that can help you get a read on {artist.artist_name}
            before the next event.
          </p>
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">{helperCopy}</p>
      </div>

      {message ? (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {playlists.map((playlist, index) => {
          const description = sanitizeDescription(playlist.description);
          const isSaved = accountState.savedPlaylistIds.includes(playlist.id);
          const isBusy = busyPlaylistId === playlist.id;

          return (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className="glass rounded-3xl border border-white/5 p-4"
            >
              <button
                type="button"
                onClick={() =>
                  setActivePlaylist(
                    activePlaylist === playlist.id ? null : playlist.id
                  )
                }
                className="w-full text-left"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-white/5">
                  <Image
                    src={playlist.images?.[0]?.url ?? PLACEHOLDER_IMAGE}
                    alt={playlist.name}
                    fill
                    sizes="(min-width: 1280px) 320px, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="line-clamp-2 text-sm font-medium text-white">
                      {playlist.name}
                    </p>
                  </div>
                </div>
              </button>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="truncate text-xs uppercase tracking-[0.2em] text-primary/80">
                    {playlist.owner.display_name || "Spotify"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {playlist.tracks.total} tracks
                  </p>
                  {description ? (
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                      {description}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {isSignedIn ? (
                    <button
                      type="button"
                      onClick={() => toggleSave(playlist, isSaved)}
                      disabled={isBusy}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors",
                        isSaved
                          ? "bg-primary text-black"
                          : "bg-white/10 text-white hover:bg-white/15",
                        isBusy && "opacity-70"
                      )}
                    >
                      {isBusy ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Bookmark
                          size={12}
                          className={cn(isSaved && "fill-current")}
                        />
                      )}
                      {isSaved ? "Saved" : "Save"}
                    </button>
                  ) : (
                    <Link
                      href={`/auth/login?next=${encodeURIComponent(pathname || "/artists")}`}
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/15"
                    >
                      <Bookmark size={12} />
                      Sign in to save
                    </Link>
                  )}

                  <a
                    href={playlist.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/5"
                  >
                    <ExternalLink size={12} />
                    Open in Spotify
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {activePlaylist ? (
        <div className="mt-6">
          <SpotifyEmbed playlistId={activePlaylist} />
        </div>
      ) : null}
    </section>
  );
}
