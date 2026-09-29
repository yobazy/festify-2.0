# Project Intelligence

## Sub-Agent Routing Rules

**Parallel dispatch** (all conditions must be met):
- 3+ unrelated tasks or independent domains
- No shared state between tasks
- Clear file boundaries with no overlap

**Sequential dispatch** (any condition triggers):
- Tasks have dependencies (B needs output from A)
- Shared files or state between tasks
- Unclear scope — understand before proceeding

**Background dispatch**:
- Research or analysis (not file modifications)
- Results aren't blocking current work

## Domain Parallel Patterns

When implementing features across domains, spawn parallel agents:
- **frontend-specialist**: Next.js pages, React components, Tailwind, Zustand — `festify/src/`
- **backend-specialist**: Node.js server, Supabase queries, Next.js API routes — `server/`, `festify/src/app/api/`
- **spotify-specialist**: Spotify OAuth, playlist generation, taste-matching, token storage
- **motion-specialist**: Framer Motion animations only — useScroll, layoutId, AnimatePresence, spring tuning
- **schema-architect**: Supabase schema, RLS policies, SQL migrations, offline caching architecture
- **code-reviewer**: Read-only diff review after implementation — always run last
- **ux-designer**: Design briefs and interaction direction — runs before frontend-specialist
- **product-manager**: Feature specs, user stories, prioritization
- **product-researcher**: Competitive analysis, user research, market gaps

Each agent owns their domain. No file overlap. Parallel only when agents touch different files.

## Self-Improving Loop

After completing any significant task:
1. Reviewer agent reads the diff and flags issues or patterns
2. Append any new conventions or lessons learned to this CLAUDE.md under ## Learned Conventions
3. Future agents inherit this context automatically

## Learned Conventions

### Product (from initial audit, 2026-03-19)
- Core value prop is day-seeded playlist generation — it's not built yet and has no direct competitor
- Current Spotify integration is client credentials only (read-only); user OAuth needed for playlist creation
- Auth exists but gates nothing — no registration flow, no user-gated features
- EventLineup is a flat pill grid with no hierarchy; popularity score on artist record can drive tier system
- Festival Dust is the main scheduling competitor; Festify's defensible position is the audio/playlist layer
- `/playlists` should behave as a public discovery page first and a personal saved library second
- Event discovery ranking should come from lineup strength first: headliner popularity carries the most weight, then support-act average, lineup depth, festival bonus, and near-term timing

### Spotify Integration
- The app's client-credentials token never reaches the browser: `festify/src/lib/spotify-server.ts` holds it; browser code calls `/api/spotify/search` and `/api/spotify/top-tracks` via `festify/src/lib/spotify.ts` (`searchPlaylists`, `getArtistTopTracks`)
- Public, CDN-cached API routes use the cookieless `lib/supabase/public.ts` client and are excluded from `src/proxy.ts` so responses never carry Set-Cookie
- User OAuth requires Authorization Code Flow; store tokens in Supabase `user_spotify_tokens` table
- Always pass `market=US` on track endpoints

### Artist image enrichment
- `server/scripts/sync-events.js` enriches artists from Spotify when `img_url` is missing and Spotify credentials are available
- Use `node scripts/sync-events.js --backfill-artists` to fill existing `artists.img_url = null` rows, or `--artists-only` to run only the artist backfill
- Artist matching is intentionally conservative: exact normalized/compact matches win first, fuzzy matches need a very strong score and clear lead, and unmatched artists should keep the placeholder

### Motion conventions
- Never animate `height: 0 → auto` — use `layout` prop or `scaleY`
- Spring physics for interactive (press/hover): `{ type: "spring", stiffness: 400, damping: 25 }`
- Entrance animations: `easeOut`, 0.3–0.6s duration
- Teal accent (`--accent: #00d4aa`) = "active/playing/live" state across the app
- `layoutId` pattern for lineup→artist avatar transition: `artist-avatar-${artist.artist_id}`

### Schema gaps (not yet built)
- `set_times` / stage data not in schema — lineup is flat artist list only
- `user_saved_sets` table needed for personal schedule feature
- `user_spotify_tokens` table needed for OAuth token storage
- Offline caching: cache event schedule + lineup to localStorage on first event page load

### Auth and settings
- Validate any login `next` redirect as a single-site relative path only; reject protocol-relative (`//...`) and absolute URLs
- Signed-in navbar affordances should route users into `/settings`, with account/session actions kept separate

### Spotify account sync
- `public.user_spotify_tokens` is service-role-only storage for Spotify OAuth tokens; do not expose it directly to user-session queries
- `public.user_saved_playlists` is the user-facing library table; playlist save flows can bookmark there even if Spotify is not connected
- Validate persisted Spotify links before writing them to the database: only allow `https://open.spotify.com/...` playlist URLs and trusted Spotify CDN image hosts

### Brand and dates (2026-09-29 logo + audit pass)
- Logo = equalizer bars rising into a stage peak + teal pennant. Use `components/brand/Logo.tsx` (`Logo`/`LogoMark`), never the old `icon.png` directly. Full mark: `public/images/logo.svg`; `src/app/icon.svg` + `favicon.ico` are a simplified 3-bar cut for 16/32px. Colors are `--brand-from/--brand-to/--brand-glow` tokens
- Never write `--` inside SVG/XML comments (invalid XML; breaks the icon)
- Event dates are calendar days: format with `lib/dates.ts` (`formatEventDate`), never `new Date(event_date)` (renders a day early in US time zones)
- "Upcoming" means the event's last day >= today (Pacific): use `upcomingEventsFilter()` in queries and `isEventUpcoming()` in JS so multi-day festivals stay listed
- Redirect targets go through `lib/redirect.ts` `getSafeRedirectPath`
- Session refresh lives in `src/proxy.ts` (Next 16 name; a root-level `middleware.ts` is ignored when `src/` exists)
- Throw on Supabase errors in pages so `error.tsx` renders; `notFound()` only for missing rows (`maybeSingle`)
- Turbopack dev sometimes serves stale `globals.css`; if a CSS change doesn't appear, stop the server and `rm -rf festify/.next`
- Event images fall back to `EVENT_PLACEHOLDER_IMAGE` (brand gradient + centered mark); `PLACEHOLDER_IMAGE` is for people/playlists only
- The festify-2 Supabase project pauses when idle and listings go stale: after a restore, run `cd server && npm run sync` before screenshots or demos (README screenshots were refreshed 2026-09-29 this way)
