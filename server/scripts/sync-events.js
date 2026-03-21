/**
 * sync-events.js
 *
 * Pulls upcoming events from EDMTrain and Resident Advisor and upserts
 * them — along with their artists and gig links — into Supabase.
 *
 * Usage:
 *   node scripts/sync-events.js
 *   npm run sync           (from the server/ directory)
 *   node scripts/sync-events.js --backfill-artists
 *   node scripts/sync-events.js --artists-only
 *
 * Required env vars (root .env or server/.env):
 *   SUPABASE_URL           Supabase project URL
 *   SUPABASE_SERVICE_KEY   Supabase service-role key (bypasses RLS for writes)
 *   EDMTRAIN_API_KEY       EDMTrain client key
 *   SPOTIFY_CLIENT_ID      Spotify client id (optional for sync, required for artist backfill)
 *   SPOTIFY_CLIENT_SECRET  Spotify client secret (optional for sync, required for artist backfill)
 */

'use strict';

const path = require('path');

// Load from root .env first, then fall back to server/.env
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

// ─── Config ──────────────────────────────────────────────────────────────────

const DAYS_AHEAD = 120; // How far into the future to pull events (~4 months)
const RA_PAGE_SIZE = 100; // Max results per RA page (their API caps at 100)
const RA_RATE_LIMIT_MS = 600; // Pause between RA pages to avoid rate limiting
const ARTIST_ENRICH_RATE_LIMIT_MS = 150; // Gentle pacing for Spotify artist lookups

// ─── Supabase client (initialized in main after env validation) ──────────────

let supabase;
let cachedSpotifyToken;
const attemptedArtistEnrichment = new Set();
const eventPopularityTiers = [
  { minimum: 85, label: 'Peak draw' },
  { minimum: 70, label: 'Hot ticket' },
  { minimum: 55, label: 'On the rise' },
];

// ─── Date helpers ─────────────────────────────────────────────────────────────

function getDateRange(daysAhead = DAYS_AHEAD) {
  const today = new Date();
  const future = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().split('T')[0];
  return { start: fmt(today), end: fmt(future) };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasSpotifyCredentials() {
  return Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
}

function normalizeArtistName(name) {
  return String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]|\{[^}]*\}/g, ' ')
    .replace(/\b(feat|featuring|ft)\b.*$/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactArtistName(name) {
  return normalizeArtistName(name).replace(/\s+/g, '');
}

function tokenizeArtistName(name) {
  return normalizeArtistName(name).split(' ').filter(Boolean);
}

function isAmbiguousArtistName(name) {
  const normalized = normalizeArtistName(name);
  const tokens = tokenizeArtistName(name);
  return normalized.length < 4 || (tokens.length === 1 && normalized.length <= 3);
}

function calculateArtistNameConfidence(sourceName, candidateName) {
  const normalizedSource = normalizeArtistName(sourceName);
  const normalizedCandidate = normalizeArtistName(candidateName);

  if (!normalizedSource || !normalizedCandidate) return 0;
  if (normalizedSource === normalizedCandidate) return 1;
  if (compactArtistName(sourceName) === compactArtistName(candidateName)) return 0.97;

  const sourceTokens = new Set(tokenizeArtistName(sourceName));
  const candidateTokens = new Set(tokenizeArtistName(candidateName));
  const sharedTokens = [...sourceTokens].filter((token) => candidateTokens.has(token));
  const unionSize = new Set([...sourceTokens, ...candidateTokens]).size || 1;
  let score = sharedTokens.length / unionSize;

  if (
    normalizedCandidate.startsWith(normalizedSource) ||
    normalizedSource.startsWith(normalizedCandidate)
  ) {
    score = Math.max(score, 0.9);
  }

  if (
    compactArtistName(candidateName).includes(compactArtistName(sourceName)) ||
    compactArtistName(sourceName).includes(compactArtistName(candidateName))
  ) {
    score = Math.max(score, 0.88);
  }

  return Number(score.toFixed(2));
}

function shouldRetrySpotifyStatus(status) {
  return status === 429 || status >= 500;
}

function getDaysAway(dateString) {
  const target = new Date(`${dateString}T00:00:00`);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateEventPopularityScore(event, artists) {
  const artistPopularities = (artists || [])
    .map((artist) => artist?.popularity || 0)
    .filter((value) => value > 0)
    .sort((a, b) => b - a);

  const headlinerScore = artistPopularities[0] || 0;
  const supportActs = artistPopularities.slice(1, 4);
  const supportAverage = supportActs.length
    ? supportActs.reduce((sum, value) => sum + value, 0) / supportActs.length
    : 0;
  const notableArtists = artistPopularities.filter((value) => value >= 55).length;
  const lineupDepthScore = Math.min(notableArtists * 4 + Math.min(artistPopularities.length, 7), 15);
  const festivalBonus = event.festivalind ? 8 : 0;
  const daysAway = getDaysAway(event.event_date);
  const timeBonus =
    daysAway < 0 ? 0 :
    daysAway <= 14 ? 7 :
    daysAway <= 30 ? 5 :
    daysAway <= 60 ? 3 :
    0;

  return Math.round(
    Math.min(
      100,
      headlinerScore * 0.6 +
      supportAverage * 0.25 +
      lineupDepthScore +
      festivalBonus +
      timeBonus
    )
  );
}

function getEventPopularityTier(score) {
  return eventPopularityTiers.find((tier) => score >= tier.minimum)?.label || 'Discovery pick';
}

async function fetchSpotifyJson(url, options, label) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url, options);

    if (response.ok) {
      return response.json();
    }

    if (!shouldRetrySpotifyStatus(response.status) || attempt === 2) {
      throw new Error(`${label} failed: ${response.status} ${response.statusText}`);
    }

    const retryAfter = Number(response.headers.get('retry-after'));
    const waitMs = Number.isFinite(retryAfter)
      ? retryAfter * 1000
      : ARTIST_ENRICH_RATE_LIMIT_MS * (attempt + 1) * 4;

    await sleep(waitMs);
  }

  throw new Error(`${label} failed`);
}

async function getSpotifyToken() {
  if (cachedSpotifyToken && Date.now() < cachedSpotifyToken.expiresAt) {
    return cachedSpotifyToken.token;
  }

  if (!hasSpotifyCredentials()) {
    throw new Error('Missing Spotify credentials');
  }

  const data = await fetchSpotifyJson(
    'https://accounts.spotify.com/api/token',
    {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    },
    'Spotify auth'
  );

  const expiresInMs =
    typeof data.expires_in === 'number'
      ? Math.max((data.expires_in - 300) * 1000, 60_000)
      : 55 * 60 * 1000;

  cachedSpotifyToken = {
    token: data.access_token,
    expiresAt: Date.now() + expiresInMs,
  };

  return cachedSpotifyToken.token;
}

async function searchSpotifyArtists(artistName) {
  const accessToken = await getSpotifyToken();
  const url = new URL('https://api.spotify.com/v1/search');
  url.searchParams.set('q', artistName);
  url.searchParams.set('type', 'artist');
  url.searchParams.set('limit', '5');

  const data = await fetchSpotifyJson(
    url.toString(),
    { headers: { Authorization: `Bearer ${accessToken}` } },
    'Spotify artist search'
  );
  return data.artists?.items ?? [];
}

function pickBestSpotifyArtistMatch(artistName, candidates) {
  const normalizedSource = normalizeArtistName(artistName);
  const exactCompactMatch = compactArtistName(artistName);
  const rankedCandidates = candidates
    .map((candidate) => ({
      artist: candidate,
      score: calculateArtistNameConfidence(artistName, candidate.name),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.artist.popularity || 0) - (a.artist.popularity || 0);
    });

  const bestMatch = rankedCandidates[0] || null;
  const secondBestMatch = rankedCandidates[1] || null;

  if (!bestMatch) return null;

  const normalizedCandidate = normalizeArtistName(bestMatch.artist.name);
  const compactCandidate = compactArtistName(bestMatch.artist.name);
  const isExactMatch =
    normalizedCandidate === normalizedSource || compactCandidate === exactCompactMatch;

  if (isAmbiguousArtistName(artistName) && !isExactMatch) {
    return null;
  }

  if (!isExactMatch && bestMatch.score < 0.96) {
    return null;
  }

  if (
    !isExactMatch &&
    secondBestMatch &&
    secondBestMatch.score >= bestMatch.score - 0.03
  ) {
    return null;
  }

  return bestMatch;
}

function buildArtistUpdates(existingArtist, spotifyArtist) {
  const updates = {};
  const imageUrl = spotifyArtist.images?.[0]?.url || null;
  const spotifyLink = spotifyArtist.external_urls?.spotify || null;

  if (!existingArtist.img_url && imageUrl) {
    updates.img_url = imageUrl;
  }
  if (!existingArtist.spotify_link && spotifyLink) {
    updates.spotify_link = spotifyLink;
  }
  if (existingArtist.popularity === null && typeof spotifyArtist.popularity === 'number') {
    updates.popularity = spotifyArtist.popularity;
  }
  if (
    (!Array.isArray(existingArtist.genres) || existingArtist.genres.length === 0) &&
    Array.isArray(spotifyArtist.genres) &&
    spotifyArtist.genres.length > 0
  ) {
    updates.genres = spotifyArtist.genres;
  }

  return updates;
}

function shouldEnrichArtist(artist) {
  return !artist.img_url;
}

async function enrichArtistFromSpotify(artist, { logPrefix = 'Artist' } = {}) {
  if (!hasSpotifyCredentials() || !shouldEnrichArtist(artist)) {
    return false;
  }

  if (attemptedArtistEnrichment.has(artist.artist_id)) {
    return false;
  }

  let attemptedLookup = false;

  try {
    attemptedLookup = true;
    attemptedArtistEnrichment.add(artist.artist_id);
    const candidates = await searchSpotifyArtists(artist.artist_name);
    const match = pickBestSpotifyArtistMatch(artist.artist_name, candidates);

    if (!match) {
      console.log(`  -  ${logPrefix}: no confident Spotify match for "${artist.artist_name}"`);
      return false;
    }

    const updates = buildArtistUpdates(artist, match.artist);
    if (Object.keys(updates).length === 0) {
      return false;
    }

    const { error } = await supabase
      .from('artists')
      .update(updates)
      .eq('artist_id', artist.artist_id);

    if (error) {
      throw new Error(error.message);
    }

    console.log(
      `  ✓  ${logPrefix}: enriched "${artist.artist_name}" from Spotify (score ${match.score.toFixed(2)})`
    );
    return true;
  } catch (err) {
    attemptedArtistEnrichment.delete(artist.artist_id);
    console.error(`  ✗  ${logPrefix}: "${artist.artist_name}" enrichment failed: ${err.message}`);
    return false;
  } finally {
    if (attemptedLookup) {
      await sleep(ARTIST_ENRICH_RATE_LIMIT_MS);
    }
  }
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

/**
 * Find or create an artist by name. Returns the artist_id.
 */
async function upsertArtist(name) {
  const { data: existing } = await supabase
    .from('artists')
    .select('artist_id, artist_name, img_url, genres, popularity, spotify_link')
    .ilike('artist_name', name)
    .maybeSingle();

  if (existing) {
    await enrichArtistFromSpotify(existing);
    return existing.artist_id;
  }

  const { data, error } = await supabase
    .from('artists')
    .insert({ artist_name: name })
    .select('artist_id, artist_name, img_url, genres, popularity, spotify_link')
    .single();

  if (error) throw new Error(`upsertArtist("${name}"): ${error.message}`);
  await enrichArtistFromSpotify(data);
  return data.artist_id;
}

/**
 * Insert or update an event, deduplicating on the source link (edmtrain_link).
 * Returns the event_id.
 */
async function upsertEvent(eventData) {
  const sourceLink = eventData.edmtrain_link;

  if (sourceLink) {
    const { data: existing } = await supabase
      .from('events')
      .select('event_id')
      .eq('edmtrain_link', sourceLink)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('events')
        .update(eventData)
        .eq('event_id', existing.event_id);
      return existing.event_id;
    }
  }

  const { data, error } = await supabase
    .from('events')
    .insert(eventData)
    .select('event_id')
    .single();

  if (error) throw new Error(`upsertEvent("${eventData.event_name}"): ${error.message}`);
  return data.event_id;
}

/**
 * Ensure a gig row exists linking an event to an artist.
 * Silently ignores duplicate-key violations.
 */
async function linkArtistToEvent(eventId, artistId) {
  const { error } = await supabase
    .from('gigs')
    .upsert(
      { event_id: eventId, artist_id: artistId },
      { onConflict: 'event_id,artist_id', ignoreDuplicates: true }
    );

  // 23505 = unique_violation; safe to ignore since we're intentionally deduplicating
  if (error && error.code !== '23505') {
    throw new Error(`linkArtistToEvent(${eventId}, ${artistId}): ${error.message}`);
  }
}

// ─── EDMTrain ─────────────────────────────────────────────────────────────────

async function syncEDMTrain() {
  console.log('🎵  Syncing EDMTrain...');

  const { start, end } = getDateRange();

  const url = new URL('https://edmtrain.com/api/events');
  url.searchParams.set('client', process.env.EDMTRAIN_API_KEY);
  url.searchParams.set('startDate', start);
  url.searchParams.set('endDate', end);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`EDMTrain HTTP ${res.status}`);

  const json = await res.json();
  if (!json.success || !json.data) throw new Error('EDMTrain returned no data');

  let synced = 0;

  for (const item of json.data) {
    try {
      // Build event name: use explicit name, or fall back to artist names
      const artistNames = (item.artistList ?? []).map(a => a.name).filter(Boolean);
      const eventName = item.name
        || (artistNames.length ? artistNames.join(', ') : null);
      if (!eventName) {
        throw new Error('Missing event name');
      }
      const eventData = {
        event_name:        eventName,
        event_date:        item.date,
        event_end_date:    item.endDate   || null,
        event_location:    item.venue?.location || item.venue?.state || '',
        event_venue:       item.venue?.name     || '',
        edmtrain_link:     item.link            || null,
        festivalind:       item.festivalInd === true,
        electronicgenreind: true,
        img_url:   null,
        alt_img:   null,
        use_alt:   false,
      };

      const eventId = await upsertEvent(eventData);

      for (const artist of item.artistList ?? []) {
        const artistId = await upsertArtist(artist.name);
        await linkArtistToEvent(eventId, artistId);
      }

      synced++;
    } catch (err) {
      console.error(`  ✗  EDMTrain — "${item.name}": ${err.message}`);
    }
  }

  console.log(`  ✓  EDMTrain: ${synced} / ${json.data.length} events synced\n`);
}

// ─── Resident Advisor ─────────────────────────────────────────────────────────

const RA_EVENTS_QUERY = /* GraphQL */ `
  query GET_EVENTS(
    $type: EventQueryType!
    $orderBy: PickOrderByType
    $areaId: ID
    $limit: Int
  ) {
    events(type: $type, orderBy: $orderBy, areaId: $areaId, limit: $limit) {
      id
      title
      date
      startTime
      endTime
      images { filename type }
      venue {
        id
        name
        area {
          name
          country { name }
        }
      }
      artists { id name }
      contentUrl
    }
  }
`;

async function fetchRAEvents({ type, orderBy, areaId, limit }) {
  const res = await fetch('https://ra.co/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Referer':      'https://ra.co/',
      'User-Agent':   'Mozilla/5.0 (compatible; Festify/2.0; +https://github.com/festify)',
    },
    body: JSON.stringify({
      query: RA_EVENTS_QUERY,
      variables: { type, orderBy, areaId, limit },
    }),
  });

  if (!res.ok) throw new Error(`RA HTTP ${res.status}`);

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`RA GraphQL error: ${json.errors[0].message}`);
  }

  return json.data?.events ?? [];
}

function raImageUrl(images) {
  if (!images?.length) return null;
  const main = images.find((img) => img.type === 'main') ?? images[0];
  return main?.filename ? `https://images.ra.co/${main.filename}` : null;
}

async function syncRA() {
  console.log('🎛️   Syncing Resident Advisor...');

  // eventListings currently returns empty/-1 without additional internal filters.
  // Instead, use area-based "picks" + "today" feeds to populate events + images.
  const areaIds = (process.env.RA_AREA_IDS ||
    // Default: major cities (ids discovered via RA areas search)
    '8,23,13,34,29,44,17,38,218,25,27,1,20,399,28'
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const feeds = [
    { type: 'PICKS', orderBy: 'THISWEEK' },
    { type: 'PICKS', orderBy: 'THISWEEKEND' },
    { type: 'TODAY', orderBy: null },
  ];

  const limitPerFeed = 100;
  const seenLinks = new Set();
  let synced = 0;
  let fetched = 0;

  for (const areaId of areaIds) {
    for (const feed of feeds) {
      let events;
      try {
        events = await fetchRAEvents({
          type: feed.type,
          orderBy: feed.orderBy,
          areaId,
          limit: limitPerFeed,
        });
      } catch (err) {
        console.error(`  ✗  RA area ${areaId} (${feed.type}${feed.orderBy ? `:${feed.orderBy}` : ''}) failed: ${err.message}`);
        continue;
      }

      fetched += events.length;

      for (const ev of events) {
        try {
          const link = ev.contentUrl ? `https://ra.co${ev.contentUrl}` : null;
          if (link && seenLinks.has(link)) continue;
          if (link) seenLinks.add(link);

          const location = [ev.venue?.area?.name, ev.venue?.area?.country?.name]
            .filter(Boolean)
            .join(', ');

          const eventData = {
            event_name:        ev.title,
            event_date:        ev.date?.split('T')[0] ?? ev.date,
            event_end_date:    null,
            event_location:    location,
            event_venue:       ev.venue?.name || '',
            edmtrain_link:     link,
            festivalind:       false,
            electronicgenreind: true,
            img_url:  raImageUrl(ev.images),
            alt_img:  null,
            use_alt:  false,
          };

          const eventId = await upsertEvent(eventData);

          for (const artist of ev.artists ?? []) {
            const artistId = await upsertArtist(artist.name);
            await linkArtistToEvent(eventId, artistId);
          }

          synced++;
        } catch (err) {
          console.error(`  ✗  RA — "${ev.title}": ${err.message}`);
        }
      }

      // Gentle pacing to avoid rate limits.
      await new Promise((r) => setTimeout(r, RA_RATE_LIMIT_MS));
    }
  }

  console.log(`  ✓  Resident Advisor: ${synced} events synced (fetched ${fetched} across ${areaIds.length} areas)\n`);
}

async function backfillArtists() {
  if (!hasSpotifyCredentials()) {
    throw new Error('Artist backfill requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET');
  }

  console.log('🖼️   Backfilling artist images from Spotify...');

  let lastArtistId = 0;
  let processed = 0;
  let enriched = 0;
  let unchanged = 0;

  while (true) {
    const { data: artists, error } = await supabase
      .from('artists')
      .select('artist_id, artist_name, img_url, genres, popularity, spotify_link')
      .is('img_url', null)
      .gt('artist_id', lastArtistId)
      .order('artist_id', { ascending: true })
      .limit(100);

    if (error) {
      throw new Error(`Artist backfill query failed: ${error.message}`);
    }
    if (!artists.length) break;

    for (const artist of artists) {
      processed++;
      lastArtistId = artist.artist_id;

      const didEnrich = await enrichArtistFromSpotify(artist, { logPrefix: 'Backfill' });
      if (didEnrich) enriched++;
      else unchanged++;
    }
  }

  console.log(
    `  ✓  Artist backfill: ${enriched} enriched / ${processed} checked (${unchanged} unchanged)\n`
  );
}

async function refreshEventPopularity() {
  console.log('📈  Refreshing event popularity...');

  const [{ data: events, error: eventsError }, { data: gigs, error: gigsError }] =
    await Promise.all([
      supabase
        .from('events')
        .select('event_id, event_date, festivalind'),
      supabase
        .from('gigs')
        .select('event_id, artists(popularity)'),
    ]);

  if (eventsError) {
    throw new Error(`Event popularity query failed: ${eventsError.message}`);
  }

  if (gigsError) {
    throw new Error(`Gig popularity query failed: ${gigsError.message}`);
  }

  const artistsByEvent = new Map();
  for (const row of gigs || []) {
    const artists = artistsByEvent.get(row.event_id) || [];
    if (row.artists) {
      artists.push(row.artists);
    }
    artistsByEvent.set(row.event_id, artists);
  }

  let updated = 0;
  for (const event of events || []) {
    const score = calculateEventPopularityScore(
      event,
      artistsByEvent.get(event.event_id) || []
    );
    const tier = getEventPopularityTier(score);
    const { error } = await supabase
      .from('events')
      .update({
        popularity_score: score,
        popularity_tier: tier,
      })
      .eq('event_id', event.event_id);

    if (error) {
      throw new Error(`Event ${event.event_id} popularity update failed: ${error.message}`);
    }

    updated++;
  }

  console.log(`  ✓  Event popularity refreshed for ${updated} events\n`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = new Set(process.argv.slice(2));
  const runEDMTrain =
    !args.has('--artists-only') &&
    (args.has('--edmtrain-only') || (!args.has('--ra-only') && !args.has('--skip-edmtrain')));
  const runRA =
    !args.has('--artists-only') &&
    (args.has('--ra-only') || (!args.has('--edmtrain-only') && !args.has('--skip-ra')));
  const runArtistBackfill = args.has('--backfill-artists') || args.has('--artists-only');

  const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
  if (runEDMTrain) requiredEnv.push('EDMTRAIN_API_KEY');
  if (runArtistBackfill) {
    requiredEnv.push('SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET');
  }

  const missing = requiredEnv.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing required env vars: ${missing.join(', ')}`);
    process.exit(1);
  }

  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  console.log(`\n🚀  Festify event sync  —  ${new Date().toISOString()}\n`);

  if (!hasSpotifyCredentials()) {
    console.log('ℹ️   Spotify credentials missing: artist image enrichment disabled.\n');
  }

  if (runEDMTrain) {
    try { await syncEDMTrain(); } catch (err) { console.error('EDMTrain sync failed:', err.message); }
  }
  if (runRA) {
    try { await syncRA();       } catch (err) { console.error('RA sync failed:',       err.message); }
  }
  if (runArtistBackfill) {
    try { await backfillArtists(); } catch (err) { console.error('Artist backfill failed:', err.message); }
  }
  if (runEDMTrain || runRA || runArtistBackfill) {
    try { await refreshEventPopularity(); } catch (err) { console.error('Event popularity refresh failed:', err.message); }
  }

  console.log('✅  Done!');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
