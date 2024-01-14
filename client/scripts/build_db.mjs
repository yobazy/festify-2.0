import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config(); // Load environment variables from .env file if you have one

// Initialize Supabase client
const SUPABASE_URL = 'https://zdbroencbancathizkro.supabase.co'
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const EDMTRAIN_KEY = process.env.REACT_APP_EDMTRAIN_KEY

console.log(EDMTRAIN_KEY)

// Fetch events from Edmtrain
async function fetchEdmtrainEvents() {

    const start_date = "2024-01-01"
    const end_date = "2024-03-27"

    const url = `https://edmtrain.com/api/events?events?startDate=${start_date}&endDate=${end_date}&livestreamInd=false&festivalInd=true&client=${EDMTRAIN_KEY}`


    const response = await fetch(url, { method: 'GET' })


    if (response.ok) {
        const data = await response.json();
        // console.log(data.data)
        console.log("events fetched...")

        return data.data || []; 
    } else {
        console.error('Failed to fetch events from Edmtrain');
        return [];
    }
}

function transformEventData(event) {
    return {
        event_id: event.id,
        // link: event.link,
        event_name: event.name,
        event_date: event.date,
        event_location: event.venue.location,
        event_venue: event.venue.name
        // venue_name: event.venue ? event.venue.name : null,  // Assuming venue object has a name property
        // artists: event.artistList ? event.artistList.join(', ') : null  // Assuming artistList is an array of artist names
    };
}

function transformVenueData(venue) {
    return {
        id: venue.id,
        name: venue.name,
        location: venue.location,
        address: venue.address,
        state: venue.state
    };
}

function transformArtistData(artist) {
    return {
        artist_id: artist.id,
        artist_name: artist.name
    };
}

// Add events, artists, venues, gigs in Supabase
async function updateSupabase(events) {
        const startTime = Date.now(); // Capture start time

        console.log('populating supabase db...')
        
        for (let event of events) {
            const transformEvent = transformEventData(event)
            const venue = event.venue
            const transformVenue = transformVenueData(venue)

            // Upsert event data
            const { eventData, eventError } = await supabase
                .from('events')
                .upsert(transformEvent);
            if (eventError) {
                console.error('Error upserting event in Supabase:', eventError);
            }

            const artists = event.artistList
            for (let artist of artists) {

                const gig = {
                    artist_id: artist.id,
                    event_id: event.id,
                }

               // Upsert artists data
                const { artistData, artistError } = await supabase
                    .from('artists')
                    .upsert(transformArtistData(artist));
                if (artistError) {
                    console.error('Error upserting artist in Supabase:', artistError);
                }

                // Upsert gigs data
                const { gigData, gigError } = await supabase
                    .from('gigs')
                    .upsert(gig);
                if (gigError) {
                console.error('Error upserting gig in Supabase:', gigError);
            }
            }
    
            // Upsert venue data
            const { venueData, venueError } = await supabase
                .from('venues')
                .upsert(transformVenue);
            if (venueError) {
                console.error('Error upserting venue in Supabase:', venueError);
            }
        }

        const endTime = Date.now(); // Capture end time
        const durationInSeconds = (endTime - startTime) / 1000; // Convert milliseconds to seconds
    
        let completeMessage = `Build DB completed in ${durationInSeconds} seconds`;
    
        // If duration is more than 60 seconds, format in minutes and seconds
        if (durationInSeconds > 60) {
            const minutes = Math.floor(durationInSeconds / 60);
            const seconds = Math.round(durationInSeconds % 60);
            completeMessage = `Build DB completed in ${minutes}m${seconds}s`;
        }

        console.log(completeMessage)
}

// Main function
async function main() {
    const events = await fetchEdmtrainEvents();
    await updateSupabase(events);
}

main();
