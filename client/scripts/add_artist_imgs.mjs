// Purpose: Fetch artist images from Spotify API and store in Supabase.

import { config } from 'dotenv';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Function to update artist image URL in Supabase
async function updateArtistImage(artistId, artistInfo) {
  console.log("updating artist image with artist ID:", artistId);

  try {
    const { data, error } = await supabase
      .from('artists')
      .update({ 'img_url': artistInfo.img_url, 'genres': artistInfo.genres, 'popularity': artistInfo.popularity, 'spotify_link': artistInfo.spotify_link })
      .eq('artist_id', artistId);
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

// search query for playlist image
async function searchSpotifyArtist(artistName, accessToken) {

  console.log("Searching playlists for event:", artistName);

  const url = `https://api.spotify.com/v1/search?q=${artistName}&type=artist&limit=5`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching artists: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('data', data);

    const imageUrl = data.artists.items[0].images[0].url;
    const genres = data.artists.items[0].genres;
    const popularity = data.artists.items[0].popularity;
    const spotifyUrl = data.artists.items[0].external_urls.spotify;

    const artistInfo = {
      img_url: imageUrl,
      genres: genres,
      popularity: popularity,
      spotify_link: spotifyUrl
    }

    return artistInfo;

  } catch (error) {
    console.error('Error in searchPlaylists:', error);
    return null;
  }
}

async function updateArtistImgUrl(accessToken, event) {
  const eventName = event.event_name; // Ensure this is a string and unique for each event
  const eventId = event.event_id;

  console.log("Updating image URL for event:", eventName, "Event ID:", eventId);

  let imgUrl = null;

  if (accessToken) {
    if (event.alt_img) {
      imgUrl = "alt_img";
    } else {
      imgUrl = await searchSpotifyArtist(eventName, accessToken);
    }
    if (imgUrl) {
      await updateArtistImage(eventId, imgUrl); // Assuming eventId is a number
    } else {
      console.log(`Failed to get image URL for event: ${eventName}`);
    }
  } else {
    console.log("Failed to get access token");
  }
}

async function main() {
  // get access token for spotify

  // for each event

  // spotfiy search for artist

  // update supabase img_url with artist image

  const accessToken = await getAccessToken();
  if (accessToken) {
    try {
      // Fetch events where img_url is NULL
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .is('img_url', null);

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      // Iterate over the events and update the image URL
      for (const event of events) {
        console.log("Processing event:", event.event_name, "Event ID:", event.event_id);
        await updateArtistImgUrl(accessToken, event);
      }
    } catch (error) {
      console.error('Error in processing events:', error);
    }
  } else {
    console.log("Failed to get access token");
  }
}


async function test() {
  const artist = "LP Giobbi"
  const artistId = "8543"
  const accessToken = await getAccessToken();
  const artistInfo = await searchSpotifyArtist(artist, accessToken)
  updateArtistImage(artistId, artistInfo)
}

test();
