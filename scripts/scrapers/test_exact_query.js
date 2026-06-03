const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  let query = supabase.from("qa_entries").select("id, question").eq("status", "answered");
  query = query.or(`question.ilike.%sup%,answer.ilike.%sup%`);
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  console.log('Results with exact logic from qa/page.tsx:');
  console.log(data);
}
run();
