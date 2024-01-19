import { config } from 'dotenv';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

config();
  // Initialize Supabase client
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log(supabaseUrl);
  console.log(supabaseAnonKey);


// get access token
async function getAccessToken() {
  var client_id = process.env.SPOTIFY_CLIENT_ID;
  var client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  console.log("getting access token...")
  const authOptions = {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials'
    })
  };

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
    if (response.ok) {
      const body = await response.json();
      const token = body.access_token;
      console.log("token recieved");
      return token;
    } else {
      throw new Error(`Error fetching token: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error in getAccessToken:', error);
  }
}

// search query for playlist image
async function searchPlaylists(eventName, accessToken) {

  console.log("searching playlists...")

  const url = `https://api.spotify.com/v1/search?q=${eventName}&type=playlist&limit=5`;

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
    console.log('data', data);

    if (data.playlists.items.length > 0 && data.playlists.items[0].images.length > 0) {
      const imageUrl = data.playlists.items[0].images[0].url;
      console.log(imageUrl);
      return imageUrl;
    } else {
      console.log("No playlists found or no images available for the playlists");
      return null;
    }
  } catch (error) {
    console.error('Error in searchPlaylists:', error);
    return null;
  }
}

// function cleanUpEventName() {
// }

// Function to update event image URL in Supabase
async function updateEventImage(eventId, imgUrl) {
  console.log("updating event image with event ID:", eventId, "and img URL:", imgUrl);

  try {
    const { data, error } = await supabase
      .from('events')
      .update({ 'img_url': imgUrl })
      .eq('event_id', eventId);
      // .select('*')

    if (error) {
      console.error('Supabase error:', JSON.stringify(error, null, 2));
      return;
    }

    console.log('Event image updated:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error in updateEventImage:', error);
  }
}

async function test() {
  const accessToken = await getAccessToken();
  if (accessToken) {
    const imgUrl = await searchPlaylists("Zamna", accessToken);
    if (imgUrl) {
      await updateEventImage('306035', imgUrl);
    } else {
      console.log("Failed to get image URL");
    }
  } else {
    console.log("Failed to get access token");
  }
}

test()

