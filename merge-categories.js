require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function mergeCategories() {
  const targetCategory = "Aqā'id";
  const sourceCategories = ["Aqa'id", "Aqa'id (Sunni Beliefs)"];

  const tables = ['articles', 'qa_entries', 'books', 'lectures'];

  for (const table of tables) {
    for (const source of sourceCategories) {
      console.log(`Updating ${table} from "${source}" to "${targetCategory}"`);
      const { data, error } = await supabase
        .from(table)
        .update({ category: targetCategory })
        .eq('category', source);
      
      if (error) {
        console.error(`Error updating ${table}:`, error);
      } else {
        console.log(`Updated ${table}`);
      }
    }
  }

  // Delete redundant categories from 'categories' table
  for (const source of sourceCategories) {
    console.log(`Deleting category "${source}"`);
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('name', source);
      
    if (error) {
      console.error(`Error deleting ${source}:`, error);
    } else {
      console.log(`Deleted category ${source}`);
    }
  }
}

mergeCategories();
