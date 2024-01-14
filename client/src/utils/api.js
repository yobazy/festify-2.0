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