import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Cookieless anon client for public, CDN-cacheable reads (events, artists,
 * gigs). Never touches the auth session, so responses can't carry Set-Cookie.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
