const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const tables = ['qa_entries', 'articles', 'lectures', 'books'];
  for (const table of tables) {
    const { data } = await supabase.from(table).select('*').ilike('title', '%sup%').limit(5);
    console.log(`Table ${table} with title like %sup%:`, data ? data.length : 0);
  }
}
run();
