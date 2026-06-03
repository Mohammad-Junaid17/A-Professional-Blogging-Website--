const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .ilike('title', '%Satanic Whispers%');
    
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  console.log('Found articles:', data);
  
  if (data && data.length > 0) {
    for (const article of data) {
      if (article.category !== 'Tasawwuf') {
        const { error: updateError } = await supabase
          .from('articles')
          .update({ category: 'Tasawwuf', status: 'published' })
          .eq('id', article.id);
          
        if (updateError) {
          console.error('Error updating:', updateError);
        } else {
          console.log(`Updated article ${article.id} category to Tasawwuf and status to published`);
        }
      }
    }
  }
}

run();
