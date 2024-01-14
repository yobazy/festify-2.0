import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

const SUPABASE_URL = 'https://zdbroencbancathizkro.supabase.co'
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getEventById(eventId) {
  let { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

  if (error) {
      console.error('Error fetching event:', error)
      return null;
  }

  return data;
}