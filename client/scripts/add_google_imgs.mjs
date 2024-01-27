// TO DO

// Decide which img url to use

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

// Function to look up event on google and return image URL
async function searchGoogleImages(eventName) {

  // TO DO - move outside of function
  // import google custom search api key and cx
  const key = process.env.GOOGLE_API_KEY
  const cx = process.env.GOOGLE_CX

  console.log("searching google for images...")

  const url = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${eventName}&searchType=image`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching google images: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items[0].link;

  } catch (error) {
    console.error('Error in searchPlaylists:', error);
    return null;
  }
}

// Function to update event image URL in Supabase
async function updateEventImage(eventId, imgUrl) {
  console.log("updating event image with event ID:", eventId, "and alt img URL:", imgUrl);

  try {
    const { data, error } = await supabase
      .from('events')
      .update({ 'alt_img': imgUrl })
      .eq('event_id', eventId);
    // .select('*')

    if (error) {
      console.error('Supabase error:', JSON.stringify(error, null, 2));
      return;
    }

    console.log('Event image updated');
  } catch (error) {
    console.error('Error in updateEventImage:', error);
  }
}



async function main() {
  // Fetch events where use_alt is TRUE
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .is('use_alt', true)
    .is('alt_img', null);

  if (error) {
    console.error('Error fetching events:', error);
    return;
  }

  console.log(events)

  // For each event in events, search google for images and update event in supabase
  for (const event of events) {
    console.log("Processing event:", event.event_name, "Event ID:", event.event_id);
    const imgUrl = await searchGoogleImages(event.event_name);
    console.log('imgUrl:', imgUrl)
    await updateEventImage(event.event_id, imgUrl);
  }
}

main();