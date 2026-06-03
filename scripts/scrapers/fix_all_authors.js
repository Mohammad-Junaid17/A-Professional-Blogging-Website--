const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAllAuthors() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, content, author');

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Scanning all ${articles.length} articles for author information...`);

  let updatedCount = 0;

  const authorRegex = /^\W*(Translated by|Translation by|Author|By |Written by|From |Mufti|Mawlana|Imam|Shaykh|Huzur|Sayyid|Allamah|Faqih)/i;

  for (const article of articles) {
    if (!article.content) continue;
    
    const lines = article.content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) continue;
    
    let foundAuthor = null;
    
    // Check first 10 lines
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i];
      if (authorRegex.test(line) && line.length < 150) {
        foundAuthor = line.replace(/^[\*\_\(\)\-\s]+|[\*\_\(\)\-\s]+$/g, '').trim();
        break;
      }
    }
    
    // Check last 10 lines if not found at top
    if (!foundAuthor) {
      for (let i = Math.max(0, lines.length - 10); i < lines.length; i++) {
        const line = lines[i];
        if (authorRegex.test(line) && line.length < 150) {
          foundAuthor = line.replace(/^[\*\_\(\)\-\s]+|[\*\_\(\)\-\s]+$/g, '').trim();
          // Break out to take the LAST matching line (or first from bottom?) 
          // Actually if we scan from top to bottom of the last 10 lines, it will take the first match.
          // Let's just break on first match.
        }
      }
    }
    
    // Filter out bad authors that are just random text that happened to start with a keyword
    // Like "By doing this..." or "From the hadith..."
    if (foundAuthor) {
      const lower = foundAuthor.toLowerCase();
      if (
        lower.startsWith('by the ') || 
        lower.startsWith('from the ') ||
        lower.startsWith('by doing ') ||
        lower.startsWith('by saying ') ||
        lower.startsWith('from this ') ||
        lower.startsWith('by observing ')
      ) {
        foundAuthor = null;
      }
    }
    
    // Determine if we need to update
    // If we didn't find anything, but current author is weird (like "saying this:"), revert to "TheSunniWay"
    let newAuthor = foundAuthor;
    
    if (!newAuthor) {
       // if current author doesn't look like a real name, reset it
       const curr = article.author || '';
       if (
         curr !== 'TheSunniWay' && 
         !curr.match(/^(Translated|Author|By|Written|From|Mufti|Mawlana|Imam|Shaykh|Huzur|Sayyid|Allamah|Faqih|Dr|Qari|Muhammad|Abu|Sidi|Bazm)/i)
       ) {
         newAuthor = 'TheSunniWay';
       }
    }
    
    if (newAuthor && newAuthor !== article.author) {
      console.log(`\nArticle: "${article.title}"`);
      console.log(`  Current: "${article.author}"`);
      console.log(`  New:     "${newAuthor}"`);
      
      const { error: updateErr } = await supabase
        .from('articles')
        .update({ author: newAuthor })
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

fixAllAuthors();
