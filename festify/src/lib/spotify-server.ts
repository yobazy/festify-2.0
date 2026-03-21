import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasAdminCredentials } from "@/lib/supabase/admin";
import type { SavedPlaylist, SpotifyPlaylist } from "@/types/playlist";

export const SPOTIFY_STATE_COOKIE = "festify_spotify_state";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const SPOTIFY_ACCOUNTS_BASE = "https://accounts.spotify.com";
let cachedAppSpotifyToken: { token: string; expiresAt: number } | null = null;
const SPOTIFY_SCOPES = [
  "playlist-modify-private",
  "playlist-modify-public",
  "user-read-email",
  "user-read-private",
];

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope?: string;
  expires_in: number;
  refresh_token?: string;
}

interface SpotifyProfileResponse {
  id: string;
  display_name: string | null;
  images?: Array<{ url: string }>;
}

interface SpotifyTokenRow {
  user_id: string;
  spotify_user_id: string;
  spotify_display_name: string | null;
  spotify_avatar_url: string | null;
  access_token: string;
  refresh_token: string;
  token_type: string;
  scope: string;
  expires_at: string;
}

export interface SavedPlaylistInput {
  playlistId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  spotifyUrl: string;
  ownerName?: string | null;
  trackTotal?: number;
  artistName?: string | null;
}

function getSpotifyCredentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify credentials");
  }

  return { clientId, clientSecret };
}

function getConfiguredSiteOrigin(fallbackOrigin: string) {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? fallbackOrigin;

  return configuredOrigin.replace(/\/$/, "");
}

function getSpotifyRedirectUri(origin: string) {
  return `${getConfiguredSiteOrigin(origin)}/api/spotify/callback`;
}

function getSpotifyTokenExpiry(expiresInSeconds: number) {
  return new Date(Date.now() + expiresInSeconds * 1000).toISOString();
}

async function requestSpotifyToken(body: URLSearchParams) {
  const { clientId, clientSecret } = getSpotifyCredentials();

  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Spotify token request failed: ${message}`);
  }

  return (await response.json()) as SpotifyTokenResponse;
}

function buildPlaylistSearchQuery(query: string, appendFestival = true) {
  let searchQuery = query;

  if (
    appendFestival &&
    !searchQuery.toLowerCase().includes("festival") &&
    !searchQuery.toLowerCase().includes("fest")
  ) {
    searchQuery += " festival";
  }

  return searchQuery;
}

async function getAppSpotifyAccessToken() {
  if (cachedAppSpotifyToken && Date.now() < cachedAppSpotifyToken.expiresAt) {
    return cachedAppSpotifyToken.token;
  }

  const token = await requestSpotifyToken(
    new URLSearchParams({ grant_type: "client_credentials" })
  );

  cachedAppSpotifyToken = {
    token: token.access_token,
    expiresAt: Date.now() + Math.max((token.expires_in - 300) * 1000, 60_000),
  };

  return cachedAppSpotifyToken.token;
}

async function getSpotifyTokenRow(userId: string) {
  if (!hasAdminCredentials()) {
    return null;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_spotify_tokens")
    .select(
      [
        "user_id",
        "spotify_user_id",
        "spotify_display_name",
        "spotify_avatar_url",
        "access_token",
        "refresh_token",
        "token_type",
        "scope",
        "expires_at",
      ].join(", ")
    )
    .eq("user_id", userId)
    .maybeSingle<SpotifyTokenRow>();

  if (error) {
    throw error;
  }

  return data;
}

async function refreshSpotifyAccessToken(row: SpotifyTokenRow) {
  if (!hasAdminCredentials()) {
    return null;
  }

  const refreshed = await requestSpotifyToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: row.refresh_token,
    })
  );

  const admin = createAdminClient();
  const updates = {
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token ?? row.refresh_token,
    token_type: refreshed.token_type ?? row.token_type,
    scope: refreshed.scope ?? row.scope,
    expires_at: getSpotifyTokenExpiry(refreshed.expires_in),
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from("user_spotify_tokens")
    .update(updates)
    .eq("user_id", row.user_id);

  if (error) {
    throw error;
  }

  return updates.access_token;
}

async function getSpotifyAccessToken(userId: string) {
  const row = await getSpotifyTokenRow(userId);

  if (!row) {
    return null;
  }

  const expiresAt = new Date(row.expires_at).getTime();
  const needsRefresh = expiresAt <= Date.now() + 60_000;

  if (!needsRefresh) {
    return row.access_token;
  }

  return refreshSpotifyAccessToken(row);
}

async function followPlaylistOnSpotify(accessToken: string, playlistId: string) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/playlists/${playlistId}/followers`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public: false }),
    }
  );

  if (!response.ok) {
    throw new Error(`Spotify follow failed: ${response.status}`);
  }
}

async function unfollowPlaylistOnSpotify(accessToken: string, playlistId: string) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/playlists/${playlistId}/followers`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Spotify unfollow failed: ${response.status}`);
  }
}

export function getSpotifyAuthorizationUrl(origin: string, state: string) {
  const { clientId } = getSpotifyCredentials();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: getSpotifyRedirectUri(origin),
    scope: SPOTIFY_SCOPES.join(" "),
    state,
  });

  return `${SPOTIFY_ACCOUNTS_BASE}/authorize?${params.toString()}`;
}

export async function exchangeSpotifyCode(origin: string, code: string) {
  return requestSpotifyToken(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getSpotifyRedirectUri(origin),
    })
  );
}

export async function fetchSpotifyProfile(accessToken: string) {
  const response = await fetch(`${SPOTIFY_API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to load Spotify profile: ${message}`);
  }

  return (await response.json()) as SpotifyProfileResponse;
}

export async function upsertSpotifyConnection(args: {
  userId: string;
  token: SpotifyTokenResponse;
  profile: SpotifyProfileResponse;
}) {
  if (!hasAdminCredentials()) {
    throw new Error("Supabase admin credentials are required for Spotify sync");
  }

  const admin = createAdminClient();
  const { userId, token, profile } = args;
  const existingConnection = await getSpotifyTokenRow(userId);
  const refreshToken = token.refresh_token ?? existingConnection?.refresh_token;

  if (!refreshToken) {
    throw new Error("Missing Spotify refresh token");
  }

  const { error } = await admin.from("user_spotify_tokens").upsert(
    {
      user_id: userId,
      spotify_user_id: profile.id,
      spotify_display_name: profile.display_name,
      spotify_avatar_url: profile.images?.[0]?.url ?? null,
      access_token: token.access_token,
      refresh_token: refreshToken,
      token_type: token.token_type,
      scope: token.scope ?? "",
      expires_at: getSpotifyTokenExpiry(token.expires_in),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    }
  );

  if (error) {
    throw error;
  }
}

export async function getSpotifyConnection(userId: string) {
  if (!hasAdminCredentials()) {
    return null;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_spotify_tokens")
    .select("spotify_display_name, spotify_avatar_url, scope, expires_at")
    .eq("user_id", userId)
    .maybeSingle<{
      spotify_display_name: string | null;
      spotify_avatar_url: string | null;
      scope: string;
      expires_at: string;
    }>();

  if (error) {
    throw error;
  }

  return data;
}

export async function searchPlaylistsForQuery(
  query: string,
  options?: {
    appendFestival?: boolean;
    limit?: number;
  }
) {
  const accessToken = await getAppSpotifyAccessToken();
  const searchQuery = buildPlaylistSearchQuery(
    query,
    options?.appendFestival ?? true
  );
  const limit = options?.limit ?? 3;
  const url = new URL(`${SPOTIFY_API_BASE}/search`);
  url.searchParams.set("q", searchQuery);
  url.searchParams.set("type", "playlist");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("market", "US");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: {
      revalidate: 60 * 30,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Spotify playlist search failed: ${message}`);
  }

  const data = (await response.json()) as {
    playlists?: { items?: Array<SpotifyPlaylist | null> };
  };

  return (data.playlists?.items ?? []).filter(
    (playlist): playlist is SpotifyPlaylist => Boolean(playlist)
  );
}

export async function disconnectSpotifyConnection(userId: string) {
  if (!hasAdminCredentials()) {
    return;
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("user_spotify_tokens")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function listSavedPlaylistsForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_saved_playlists")
    .select(
      [
        "id",
        "playlist_id",
        "name",
        "description",
        "image_url",
        "spotify_url",
        "owner_name",
        "track_total",
        "artist_name",
        "created_at",
      ].join(", ")
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as SavedPlaylist[];
}

export async function listSavedPlaylistIdsForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_saved_playlists")
    .select("playlist_id")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as Array<{ playlist_id: string }>).map(
    (playlist) => playlist.playlist_id
  );
}

export async function savePlaylistForUser(
  userId: string,
  playlist: SavedPlaylistInput
) {
  const supabase = await createClient();

  const { error } = await supabase.from("user_saved_playlists").upsert(
    {
      user_id: userId,
      playlist_id: playlist.playlistId,
      name: playlist.name,
      description: playlist.description ?? null,
      image_url: playlist.imageUrl ?? null,
      spotify_url: playlist.spotifyUrl,
      owner_name: playlist.ownerName ?? null,
      track_total: playlist.trackTotal ?? 0,
      artist_name: playlist.artistName ?? null,
    },
    {
      onConflict: "user_id,playlist_id",
    }
  );

  if (error) {
    throw error;
  }

  const accessToken = await getSpotifyAccessToken(userId);

  if (!accessToken) {
    return {
      spotifyConnected: false,
      spotifySynced: false,
    };
  }

  try {
    await followPlaylistOnSpotify(accessToken, playlist.playlistId);
    return {
      spotifyConnected: true,
      spotifySynced: true,
    };
  } catch (error) {
    console.error("Failed to follow playlist on Spotify", error);
    return {
      spotifyConnected: true,
      spotifySynced: false,
    };
  }
}

export async function removeSavedPlaylistForUser(
  userId: string,
  playlistId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_saved_playlists")
    .delete()
    .eq("user_id", userId)
    .eq("playlist_id", playlistId);

  if (error) {
    throw error;
  }

  const accessToken = await getSpotifyAccessToken(userId);

  if (!accessToken) {
    return {
      spotifyConnected: false,
      spotifySynced: false,
    };
  }

  try {
    await unfollowPlaylistOnSpotify(accessToken, playlistId);
    return {
      spotifyConnected: true,
      spotifySynced: true,
    };
  } catch (error) {
    console.error("Failed to unfollow playlist on Spotify", error);
    return {
      spotifyConnected: true,
      spotifySynced: false,
    };
  }
}
