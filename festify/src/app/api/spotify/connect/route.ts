import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasAdminCredentials } from "@/lib/supabase/admin";
import {
  getSpotifyAuthorizationUrl,
  SPOTIFY_STATE_COOKIE,
} from "@/lib/spotify-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login?next=/settings/music", url));
  }

  if (!hasAdminCredentials()) {
    return NextResponse.redirect(
      new URL("/settings/music?spotify=setup-required", url)
    );
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();

  cookieStore.set(SPOTIFY_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: url.protocol === "https:",
    path: "/",
    maxAge: 60 * 10,
  });

  return NextResponse.redirect(getSpotifyAuthorizationUrl(url.origin, state));
}
