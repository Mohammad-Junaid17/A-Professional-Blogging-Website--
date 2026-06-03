const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data, error } = await supabase.from('lectures').insert({
    title: 'Superiority of Siddiq e Akbar',
    description: 'Brilliant speech on the superiority of the Sahaba e Kiraam and Hazrat Abu Bakr Siddiq may Allah be pleased with them all, by Mufti Zahid Hussain at Haq Chaar Yaar Conference Dudley 2013',
    scholar: 'Mufti Zahid Hussain Al-Qadri',
    category: 'Speeches',
    youtube_url: null, // Placeholder
  });
  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log('Inserted Superiority of Siddiq e Akbar successfully!');
  }
}
run();
