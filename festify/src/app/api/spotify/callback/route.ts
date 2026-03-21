import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  exchangeSpotifyCode,
  fetchSpotifyProfile,
  SPOTIFY_STATE_COOKIE,
  upsertSpotifyConnection,
} from "@/lib/spotify-server";

function clearSpotifyStateCookie(
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  cookieStore.set(SPOTIFY_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(SPOTIFY_STATE_COOKIE)?.value;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    clearSpotifyStateCookie(cookieStore);
    return NextResponse.redirect(new URL("/auth/login?next=/settings/music", url));
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    clearSpotifyStateCookie(cookieStore);
    return NextResponse.redirect(new URL("/settings/music?spotify=error", url));
  }

  try {
    const token = await exchangeSpotifyCode(url.origin, code);
    const profile = await fetchSpotifyProfile(token.access_token);

    await upsertSpotifyConnection({
      userId: user.id,
      token,
      profile,
    });

    clearSpotifyStateCookie(cookieStore);
    return NextResponse.redirect(
      new URL("/settings/music?spotify=connected", url)
    );
  } catch (error) {
    console.error("Spotify callback failed", error);
    clearSpotifyStateCookie(cookieStore);
    return NextResponse.redirect(new URL("/settings/music?spotify=error", url));
  }
}
