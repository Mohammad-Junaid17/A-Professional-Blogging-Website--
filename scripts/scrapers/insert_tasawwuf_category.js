const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('content_type', 'articles')
    .eq('name', 'Tasawwuf')
    .single();
    
  if (!existing) {
    await supabase.from('categories').insert({ name: 'Tasawwuf', content_type: 'articles' });
    console.log('Inserted category: Tasawwuf');
  } else {
    console.log('Category already exists: Tasawwuf');
  }
}
run();
