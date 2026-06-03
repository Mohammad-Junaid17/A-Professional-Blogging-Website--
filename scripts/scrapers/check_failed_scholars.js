const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data, error } = await supabase
    .from('qa_entries')
    .select('id, question, answer')
    .eq('answered_by', 'TheSunniWay')
    .not('answer', 'is', null)
    .limit(30);
    
  if (data) {
    for (const d of data) {
      console.log(`\n--- Q: ${d.question} ---`);
      console.log(d.answer.substring(Math.max(0, d.answer.length - 200)));
    }
  }
}
run();
