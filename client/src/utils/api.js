// move all these files to backend once created
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zdbroencbancathizkro.supabase.co'
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_KEY 
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getEventById(eventId) {
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

// move to endpoint
export async function getSpotifyToken() {
  try {
    const response = await fetch('http://localhost:8080/spotifytoken');
    console.log('response data', response)
    if (response.ok) {
      const body = await response.json();
      const token = body.access_token;
      return token;
    } else {
      throw new Error(`Error fetching localhost spotify token: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error in getAccessToken:', error);
  }
}

export async function searchPlaylists(eventName, accessToken) {

  console.log("Searching playlists for event:", eventName);

  const urlEncodedEventName = encodeURIComponent(eventName);
  const url = `https://api.spotify.com/v1/search?q=${urlEncodedEventName}&type=playlist&limit=15`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching playlists: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('playlist data', data);

    // TODO if there is more than one image, dont pass the image url
    if (data.playlists) {
      const playlists = data.playlists.items;
      return playlists
    } else {
      console.log("No playlists found or no images available for the playlists");
      return null;
    }
  } catch (error) {
    console.error('Error in searchPlaylists:', error);
    return null;
  }
}