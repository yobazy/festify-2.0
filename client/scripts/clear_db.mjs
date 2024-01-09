import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config(); // Load environment variables from .env file if you have one

// Initialize Supabase client
const SUPABASE_URL = 'https://zdbroencbancathizkro.supabase.co'
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function clearTable(tableName) {
    const { data, error } = await supabase
        .from(tableName)
        .delete()
        .match({}); // This will match all records

    if (error) {
        console.error(`Error clearing table ${tableName}:`, error);
    } else {
        console.log(`Cleared table ${tableName}.`);
    }
}

async function clearDatabase() {
    await clearTable('events');
    await clearTable('venues');
    await clearTable('artists');
    await clearTable('gigs');

    console.log('All tables cleared.');
}

clearDatabase();