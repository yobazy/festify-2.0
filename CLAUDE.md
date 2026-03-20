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

### Spotify Integration
- `festify/src/lib/spotify.ts` has: client credentials token fetch, `searchPlaylists`, `searchArtist`, `getArtistTopTracks`
- `festify/src/app/api/spotify/token/` — existing token endpoint (client credentials, not user OAuth)
- User OAuth requires Authorization Code Flow; store tokens in Supabase `user_spotify_tokens` table
- Always pass `market=US` on track endpoints

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