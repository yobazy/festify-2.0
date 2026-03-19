import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase auth callback handler.
 * Supabase redirects here after email confirmation, magic links, and OAuth flows.
 * It exchanges the one-time `code` in the URL for a session, then redirects
 * the user to their intended destination (or home).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — redirect to login with an error hint
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
