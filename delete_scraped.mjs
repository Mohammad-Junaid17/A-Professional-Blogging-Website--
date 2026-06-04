import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteScraped() {
  console.log("Deleting scraped entries...");
  
  // Find entries that contain "*Taken from SunnahCentral*"
  const { data, error } = await supabase
    .from('qa_entries')
    .delete()
    .like('answer', '%*Taken from SunnahCentral*%');
    
  if (error) {
    console.error("Error deleting:", error);
  } else {
    console.log("Successfully deleted the imported entries.");
  }
}

deleteScraped();
