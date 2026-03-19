/**
 * sync-events.js
 *
 * Pulls upcoming events from EDMTrain and Resident Advisor and upserts
 * them — along with their artists and gig links — into Supabase.
 *
 * Usage:
 *   node scripts/sync-events.js
 *   npm run sync           (from the server/ directory)
 *
 * Required env vars (root .env or server/.env):
 *   SUPABASE_URL           Supabase project URL
 *   SUPABASE_SERVICE_KEY   Supabase service-role key (bypasses RLS for writes)
 *   EDMTRAIN_API_KEY       EDMTrain client key
 */

'use strict';

const path = require('path');

// Load from root .env first, then fall back to server/.env
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

// ─── Config ──────────────────────────────────────────────────────────────────

const DAYS_AHEAD = 90; // How far into the future to pull events
const RA_PAGE_SIZE = 100; // Max results per RA page (their API caps at 100)
const RA_RATE_LIMIT_MS = 600; // Pause between RA pages to avoid rate limiting

// ─── Supabase client ─────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ─── Date helpers ─────────────────────────────────────────────────────────────

function getDateRange(daysAhead = DAYS_AHEAD) {
  const today = new Date();
  const future = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().split('T')[0];
  return { start: fmt(today), end: fmt(future) };
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

/**
 * Find or create an artist by name. Returns the artist_id.
 */
async function upsertArtist(name) {
  const { data: existing } = await supabase
    .from('artists')
    .select('artist_id')
    .ilike('artist_name', name)
    .maybeSingle();

  if (existing) return existing.artist_id;

  const { data, error } = await supabase
    .from('artists')
    .insert({ artist_name: name })
    .select('artist_id')
    .single();

  if (error) throw new Error(`upsertArtist("${name}"): ${error.message}`);
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
      const eventData = {
        event_name:        item.name,
        event_date:        item.date,
        event_end_date:    item.endDate   || null,
        event_location:    item.location?.metro || item.location?.state || '',
        event_venue:       item.location?.name  || '',
        edmtrain_link:     item.link            || null,
        festivalInd:       item.festivalInd  === 1,
        livestreamInd:     item.livestreamInd === 1,
        electronicGenreInd: true,
        img_url:   null,
        alt_img:   null,
        use_alt:   false,
      };

      const eventId = await upsertEvent(eventData);

      for (const artist of item.artists ?? []) {
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

const RA_QUERY = /* GraphQL */ `
  query GET_EVENT_LISTINGS(
    $filters: EventListingFilterInputType
    $pageSize: Int
    $page: Int
  ) {
    eventListings(filters: $filters, pageSize: $pageSize, page: $page) {
      totalResults
      data {
        id
        listingDate
        event {
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
    }
  }
`;

async function fetchRAPage(dateFrom, dateTo, page) {
  const res = await fetch('https://ra.co/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Referer':      'https://ra.co/',
      'User-Agent':   'Mozilla/5.0 (compatible; Festify/2.0; +https://github.com/festify)',
    },
    body: JSON.stringify({
      query: RA_QUERY,
      variables: {
        filters:  { dateFrom, dateTo },
        page,
        pageSize: RA_PAGE_SIZE,
      },
    }),
  });

  if (!res.ok) throw new Error(`RA HTTP ${res.status}`);

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(`RA GraphQL error: ${json.errors[0].message}`);
  }

  return json.data?.eventListings ?? null;
}

function raImageUrl(images) {
  if (!images?.length) return null;
  const main = images.find((img) => img.type === 'main') ?? images[0];
  return main?.filename ? `https://images.ra.co/${main.filename}` : null;
}

async function syncRA() {
  console.log('🎛️   Syncing Resident Advisor (worldwide)...');

  const { start, end } = getDateRange();

  let page = 1;
  let totalResults = null;
  let fetched = 0;
  let synced = 0;

  do {
    let result;
    try {
      result = await fetchRAPage(start, end, page);
    } catch (err) {
      console.error(`  ✗  RA page ${page} fetch failed: ${err.message}`);
      break;
    }

    if (!result) break;

    if (totalResults === null) {
      totalResults = result.totalResults;
      console.log(`  Found ${totalResults} RA listings — fetching in pages of ${RA_PAGE_SIZE}...`);
    }

    const listings = result.data ?? [];
    fetched += listings.length;

    for (const listing of listings) {
      const ev = listing.event;
      if (!ev) continue;

      try {
        const location = [ev.venue?.area?.name, ev.venue?.area?.country?.name]
          .filter(Boolean)
          .join(', ');

        const eventData = {
          event_name:        ev.title,
          event_date:        ev.date?.split('T')[0] ?? ev.date,
          event_end_date:    null,
          event_location:    location,
          event_venue:       ev.venue?.name || '',
          edmtrain_link:     ev.contentUrl ? `https://ra.co${ev.contentUrl}` : null,
          festivalInd:       false,
          livestreamInd:     false,
          electronicGenreInd: true,
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

    console.log(`  Page ${page}: ${synced} synced so far (${fetched} / ${totalResults} fetched)...`);
    page++;

    if (fetched < totalResults) {
      await new Promise((r) => setTimeout(r, RA_RATE_LIMIT_MS));
    }
  } while (fetched < totalResults);

  console.log(`  ✓  Resident Advisor: ${synced} / ${totalResults} events synced\n`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const missing = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'EDMTRAIN_API_KEY'].filter(
    (k) => !process.env[k]
  );
  if (missing.length) {
    console.error(`Missing required env vars: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log(`\n🚀  Festify event sync  —  ${new Date().toISOString()}\n`);

  try { await syncEDMTrain(); } catch (err) { console.error('EDMTrain sync failed:', err.message); }
  try { await syncRA();       } catch (err) { console.error('RA sync failed:',       err.message); }

  console.log('✅  Done!');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
