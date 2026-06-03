const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanup() {
  const { error } = await supabase
    .from('articles')
    .update({ sub_category: null })
    .eq('sub_category', 'View items...');
    
  if (error) {
    console.error('Error cleaning up View items:', error.message);
  } else {
    console.log('✅ Cleaned up any stray "View items..." subcategories.');
  }
}
cleanup();
