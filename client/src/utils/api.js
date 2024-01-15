import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zdbroencbancathizkro.supabase.co'
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getEventById(eventId) {
  console.log('env', process.env.REACT_APP_SUPABASE_KEY)

  let { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_id', eventId)
      .single()

  if (error) {
      console.error('Error fetching event:', error)
      return null;
  }

  return data;
}

export async function getArtistsForEvent(eventId) {
  // Step 1: Get all artist_ids for the given event_id from the gigs table
  let { data: gigs, error: gigsError } = await supabase
      .from('gigs')
      .select('artist_id')
      .eq('event_id', eventId);

  if (gigsError) {
      console.error('Error fetching gigs:', gigsError);
      return null;
  }

  // Step 2: For each artist_id, get the artist details from the artists table
  let artists = [];
  for (const gig of gigs) {
      let { data: artist, error: artistError } = await supabase
          .from('artists')
          .select('*')
          .eq('artist_id', gig.artist_id)
          .single();

      if (artistError) {
          console.error('Error fetching artist:', artistError);
          continue; // Skip this artist if there's an error
      }

      artists.push(artist);
  }

  return artists;
}