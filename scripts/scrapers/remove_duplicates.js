const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findAndDeleteDuplicates() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, created_at, category, sub_category');

  if (error) {
    console.error(error);
    return;
  }

  // Group by title (case-insensitive and trimmed)
  const titleMap = new Map();
  for (const article of articles) {
    const normTitle = article.title.trim().toLowerCase();
    if (!titleMap.has(normTitle)) {
      titleMap.set(normTitle, []);
    }
    titleMap.get(normTitle).push(article);
  }

  let deletedCount = 0;
  
  for (const [title, group] of titleMap.entries()) {
    if (group.length > 1) {
      console.log(`\nDuplicate found: "${title}" (${group.length} copies)`);
      
      // Sort by creation date (keep the oldest, or maybe the one with a sub_category)
      // Actually, let's prioritize keeping the one that has a sub_category, then oldest.
      group.sort((a, b) => {
        if (a.sub_category && !b.sub_category) return -1;
        if (!a.sub_category && b.sub_category) return 1;
        return new Date(a.created_at) - new Date(b.created_at);
      });
      
      const toKeep = group[0];
      const toDelete = group.slice(1);
      
      console.log(`  Keeping: ID ${toKeep.id} (Category: ${toKeep.category}, SubCat: ${toKeep.sub_category})`);
      
      const idsToDelete = toDelete.map(a => a.id);
      
      const { error: delErr } = await supabase
        .from('articles')
        .delete()
        .in('id', idsToDelete);
        
      if (delErr) {
        console.error(`  Error deleting copies of "${title}":`, delErr.message);
      } else {
        console.log(`  ✅ Deleted ${idsToDelete.length} duplicates.`);
        deletedCount += idsToDelete.length;
      }
    }
  }
  
  console.log(`\nCleanup complete. Total duplicates removed: ${deletedCount}`);
}

findAndDeleteDuplicates();
