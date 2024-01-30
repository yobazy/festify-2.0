import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config(); // Load environment variables from .env file if you have one

// Initialize Supabase client
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const EDMTRAIN_KEY = process.env.REACT_APP_EDMTRAIN_KEY

console.log(EDMTRAIN_KEY)

// Fetch events from Edmtrain
async function fetchEdmtrainEvents() {

    const start_date = "2024-02-01"
    const end_date = "2024-02-02"
    // const end_date = "2024-02-01"

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
        edmtrain_link: event.link,
        event_name: event.name,
        event_date: event.date,
        // event_end_date: event.end_date,
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

// Merge events with the same name and update their end_date
function mergeEventsAndUpdateEndDate(events) {

    const eventMap = new Map();

    events.forEach(event => {
        const eventName = event.name; // or event.event_name, depending on your data structure
        if (eventMap.has(eventName)) {
            const existingEvent = eventMap.get(eventName);
            // Assuming date format is correct and comparable
            if (!existingEvent.end_date || new Date(event.date) > new Date(existingEvent.end_date)) {
                existingEvent.end_date = event.date;
            }
        } else {
            eventMap.set(eventName, { ...event, end_date: event.date });
        }
    });

    console.log('return', Array.from(eventMap.values()))
    return Array.from(eventMap.values());
}

// Add events, artists, venues, gigs in Supabase
async function updateSupabase(events) {
        const startTime = Date.now(); // Capture start time

        console.log('populating supabase db...')

        const mergedEvents = mergeEventsAndUpdateEndDate(events);

        for (let event of mergedEvents) {

            const transformEvent = transformEventData(event)
            const venue = event.venue
            const transformVenue = transformVenueData(venue)

            // Upsert event data
            const { error: eventError } = await supabase
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
                const { error: artistError } = await supabase
                    .from('artists')
                    .upsert(transformArtistData(artist));
                if (artistError) {
                    console.error('Error upserting artist in Supabase:', artistError);
                }

                // Upsert gigs data
                const { error: gigError } = await supabase
                    .from('gigs')
                    .upsert(gig);
                if (gigError) {
                console.error('Error upserting gig in Supabase:', gigError);
            }
            }
    
            // Upsert venue data
            const { error: venueError } = await supabase
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
