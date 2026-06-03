const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAuthors() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, content, author')
    .eq('author', 'TheSunniWay');

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Found ${articles.length} articles with author "TheSunniWay". Scanning content for authors...`);

  let updatedCount = 0;

  for (const article of articles) {
    if (!article.content) continue;
    
    const lines = article.content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) continue;
    
    // Check the last 3 non-empty lines just in case
    let foundAuthor = null;
    const authorRegex = /^\W*(Translated|Author|By|Mufti|Mawlana|Imam|Shaykh|Written|Translated by|From|Huzur|Sayyid|Allamah|Faqih)/i;
    
    for (let i = Math.max(0, lines.length - 3); i < lines.length; i++) {
      const line = lines[i];
      if (authorRegex.test(line) && line.length < 150) { // arbitrary length limit to avoid catching a whole paragraph
        // Extract author by removing leading/trailing punctuation like *, _, (, )
        foundAuthor = line.replace(/^[\*\_\(\)\-\s]+|[\*\_\(\)\-\s]+$/g, '').trim();
        break;
      }
    }
    
    if (foundAuthor) {
      console.log(`\nArticle: "${article.title}"`);
      console.log(`  Found author: "${foundAuthor}" (Replacing "TheSunniWay")`);
      
      const { error: updateErr } = await supabase
        .from('articles')
        .update({ author: foundAuthor })
        .eq('id', article.id);
        
      if (updateErr) {
        console.error(`  Failed to update:`, updateErr.message);
      } else {
        updatedCount++;
      }
    }
  }
  
  console.log(`\nComplete! Updated ${updatedCount} authors.`);
}

fixAuthors();
