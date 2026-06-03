const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data, error } = await supabase.from('qa_entries').select('id, question, status, category').ilike('answer', '%sup%');
  
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  console.log('Results with answer containing sup:');
  console.log(data);
}
run();
