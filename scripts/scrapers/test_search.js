const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data, error } = await supabase
    .from('qa_entries')
    .select('id, question, answer')
    .ilike('question', '%sup%');
    
  console.log('Search in question for %sup% returned', data?.length || 0, 'results');
  if (data) {
    data.forEach(d => console.log(' ->', d.question));
  }
  
  const { data: data2 } = await supabase
    .from('qa_entries')
    .select('id, question, answer')
    .or('question.ilike.%sup%,answer.ilike.%sup%');
    
  console.log('Search in question+answer for %sup% returned', data2?.length || 0, 'results');
}
run();
