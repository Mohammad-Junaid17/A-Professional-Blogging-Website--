const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data, error } = await supabase
    .from('qa_entries')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error fetching:', error);
  } else {
    console.log('Columns in qa_entries:', data.length > 0 ? Object.keys(data[0]) : 'No data, but table exists.');
    if (data.length > 0) {
      console.log('Sample row:', data[0]);
    }
  }
}

run();
