const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function extractScholar(answer) {
  if (!answer) return "TheSunniWay";
  
  const tail = answer.slice(-500);
  
  // Explicitly look for "Translated by..."
  let match = tail.match(/\[?Translated by\]?[\s:]*([^\n]+)/i);
  if (match) {
    let name = match[1].replace(/\*|_/g, '').trim();
    if (name) return "Translated by " + name;
  }
  
  // Look for Faqeer Zahid Hussain or similar
  if (tail.match(/(?:Faqeer\s+)?Zahid Hus(?:s)?ain/i)) {
    return "Mufti Zahid Hussain Al-Qadri";
  }
  
  if (tail.match(/Mufti Sufyan Qadri/i)) {
    return "Mufti Sufyan Qadri";
  }
  
  if (tail.match(/Muhammad Junaid Raza/i)) {
    return "Muhammad Junaid Raza";
  }
  
  // Answered by pattern
  match = tail.match(/Answered by[\s:]*([^\n]+)/i);
  if (match) {
    return match[1].replace(/\*|_/g, '').trim();
  }
  
  return "TheSunniWay";
}

async function run() {
  const { data, error } = await supabase
    .from('qa_entries')
    .select('id, answer');
    
  if (error) {
    console.error(error);
    return;
  }
  
  let updated = 0;
  for (const row of data) {
    const scholarName = extractScholar(row.answer);
    
    // Update the answered_by column
    const { error: updError } = await supabase
      .from('qa_entries')
      .update({ answered_by: scholarName })
      .eq('id', row.id);
      
    if (updError) {
      console.error('Error updating', row.id, updError.message);
    } else {
      updated++;
    }
  }
  console.log(`Updated ${updated} entries.`);
}

run();
