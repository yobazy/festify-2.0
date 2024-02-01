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
async function updateArtistImage(artistId, imgUrl) {
  console.log("updating event image with artist ID:", artistId, "and img URL:", imgUrl);

  try {
    const { data, error } = await supabase
      .from('events')
      .update({ 'img_url': imgUrl })
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