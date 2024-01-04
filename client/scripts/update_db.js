const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const SUPABASE_URL = 'https://zdbroencbancathizkro.supabase.co'
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// Update events in Supabase
async function updateSupabase(events) {
  for (let event of events) {
      // Check if the event already exists based on a unique identifier
      // Assuming event_id is your unique identifier
      const { data, error } = await supabase
          .from('events')
          .select('event_id')
          .eq('event_id', event.event_id);

      if (error) {
          console.error('Error fetching event from Supabase:', error);
          continue;
      }

      if (data.length === 0) {
          // Event does not exist in the database, insert it
          const { insertError } = await supabase
              .from('events')
              .insert([event]);

          if (insertError) {
              console.error('Error inserting event into Supabase:', insertError);
          }
      }
  }
}
