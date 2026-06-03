const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncCategories() {
  // 1. Get all unique categories from articles
  const { data: articles, error: err1 } = await supabase.from('articles').select('category');
  if (err1) {
    console.error('Error fetching articles:', err1);
    return;
  }
  
  const uniqueArticleCategories = [...new Set(articles.map(a => a.category).filter(Boolean))];
  console.log('Unique categories in articles table:', uniqueArticleCategories);

  // 2. Get existing categories for articles
  const { data: existingCats, error: err2 } = await supabase
    .from('categories')
    .select('name')
    .or('content_type.eq.articles,content_type.is.null');
    
  if (err2) {
    console.error('Error fetching categories:', err2);
    return;
  }
  
  const existingCatNames = new Set(existingCats.map(c => c.name));
  
  // 3. Insert missing categories
  for (const catName of uniqueArticleCategories) {
    if (!existingCatNames.has(catName)) {
      console.log(`Inserting missing category: ${catName}`);
      const { error: insertErr } = await supabase.from('categories').insert({
        name: catName,
        content_type: 'articles'
      });
      if (insertErr) {
        console.error(`Failed to insert ${catName}:`, insertErr.message);
      } else {
        console.log(`✅ Added ${catName} to categories table`);
      }
    }
  }
  
  console.log('Category sync complete!');
}

syncCategories();
