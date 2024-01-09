const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const SUPABASE_URL = 'https://zdbroencbancathizkro.supabase.co'
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const EDMTRAIN_KEY = process.env.REACT_APP_EDMTRAIN_KEY

console.log(EDMTRAIN_KEY)

// Fetch events from Edmtrain
async function fetchEdmtrainEvents() {

    const start_date = "2023-10-29"
    const end_date = "2024-10-27"

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

// Update events in Supabase
async function updateSupabase(events) {
    console.log('Updating Supabase database...');

    for (let event of events) {
        const transformedEvent = transformEventData(event);
        const venue = event.venue;
        const transformedVenue = transformVenueData(venue);

        // Check if the event already exists in the database
        const { data: existingEvent, error: selectError } = await supabase
            .from('events')
            .select('event_id')
            .eq('event_id', transformedEvent.event_id)
            .single();

        if (selectError) {
            console.error('Error checking for existing event in Supabase:', selectError);
            continue;
        }

        // If the event does not exist, upsert it
        if (!existingEvent) {
            const { eventData, eventError } = await supabase
                .from('events')
                .upsert(transformedEvent);
            if (eventError) {
                console.error('Error upserting event in Supabase:', eventError);
                continue;
            }

            const { venueData, venueError } = await supabase
                .from('venues')
                .upsert(transformedVenue);
            if (venueError) {
                console.error('Error upserting venue in Supabase:', venueError);
                continue;
            }

            // Add code for upserting artist and gig data here, similar to the existing code
        } else {
            console.log(`Event with ID ${transformedEvent.event_id} already exists, skipping upsert.`);
        }
    }

    console.log('Database update complete.');
}

// Main function
async function main() {
    const events = await fetchEdmtrainEvents();
    await updateSupabase(events);
}

main();