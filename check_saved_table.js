require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  console.log("Fetching a profile to test with...");
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id').limit(1);
  if (pErr || !profiles || profiles.length === 0) {
    console.error("No profiles found or error:", pErr);
    return;
  }
  
  const userId = profiles[0].id;
  console.log("Using user_id:", userId);
  
  console.log("Fetching an article to test with...");
  const { data: articles, error: aErr } = await supabase.from('articles').select('id').limit(1);
  if (aErr || !articles || articles.length === 0) {
    console.error("No articles found or error:", aErr);
    return;
  }
  
  const contentId = articles[0].id;
  console.log("Using content_id:", contentId);
  
  console.log("Inserting into saved_items...");
  const { error } = await supabase.from('saved_items').insert({
    user_id: userId,
    content_type: 'article',
    content_id: contentId
  });
  
  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log("Insert success!");
    // cleanup
    await supabase.from('saved_items').delete().eq('user_id', userId).eq('content_id', contentId);
  }
}

test();
