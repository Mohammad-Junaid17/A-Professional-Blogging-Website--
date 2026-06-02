const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const categories = [
    "Aqa'id (Sunni Beliefs)",
    "Hadith & Seerah",
    "Imam Ahmed Rida",
    "Imam e Aazam and Hanafi Fiqh",
    "Miscellaneous"
  ];
  
  for (const name of categories) {
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('content_type', 'books')
      .eq('name', name)
      .single();
      
    if (!existing) {
      await supabase.from('categories').insert({ name, content_type: 'books' });
      console.log('Inserted:', name);
    } else {
      console.log('Exists:', name);
    }
  }
}
run();
