const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data, error } = await supabase.from('qa_entries').select('id, answer');
  
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  let updatedCount = 0;
  for (const entry of data) {
    if (!entry.answer) continue;
    
    // Replace markdown links that start with a relative path
    let newAnswer = entry.answer.replace(/\]\(\//g, '](https://www.thesunniway.com/');
    
    if (newAnswer !== entry.answer) {
      await supabase.from('qa_entries').update({ answer: newAnswer }).eq('id', entry.id);
      updatedCount++;
    }
  }
  
  console.log(`Successfully updated ${updatedCount} entries with absolute links.`);
}
run();
