/**
 * Books Scraper for TheSunniWay English Ebooks
 * Fetches all books from https://www.thesunniway.com/ebooks/english and inserts into Supabase books table.
 * Run: node scrape_books.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&[a-z]+;/gi, '');
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchCategories() {
  const url = 'https://www.thesunniway.com/ebooks/english';
  console.log(`Fetching main categories page: ${url}`);
  
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)' },
  });
  
  if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
  
  const html = await res.text();
  
  const categoryRegex = /<div class="pd-subcategory"><a href="(\/ebooks\/english\/category\/[^"]+)">([^<]+)<\/a>/gi;
  const categories = [];
  let match;
  
  while ((match = categoryRegex.exec(html)) !== null) {
    categories.push({
      path: match[1],
      name: decodeHtmlEntities(match[2].trim()),
    });
  }
  
  return categories;
}

async function fetchBooksForCategory(category) {
  const url = `https://www.thesunniway.com${category.path}`;
  console.log(`\nFetching books for category: ${category.name} from ${url}`);
  
  // POST request with limit=0 to get all books
  const formData = new URLSearchParams();
  formData.append('limit', '0');
  
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  if (!res.ok) {
    console.warn(`  ⚠️ HTTP Error ${res.status} for ${category.name}`);
    return [];
  }
  
  const html = await res.text();
  
  // Parse books
  const books = [];
  // Each book is in <div class="pd-filebox">...</div>
  // The regex splits by pd-filebox to process each book individually
  const fileBoxes = html.split('<div class="pd-filebox">').slice(1);
  
  for (const box of fileBoxes) {
    // Extract title and download link
    // <div class="pd-filename">...<a href="/ebooks/english/file/...">Title</a>
    const linkMatch = box.match(/<div class="pd-filename">.*?<a href="(\/ebooks\/english\/file\/[^"]+)"[^>]*>(.*?)<\/a>/i);
    
    // Extract description
    // <div class="pd-fdesc"><p>Description text...</p></div>
    const descMatch = box.match(/<div class="pd-fdesc">([\s\S]*?)<\/div>/i);
    
    if (linkMatch) {
      const pdfPath = linkMatch[1];
      const titleHTML = linkMatch[2];
      
      let title = titleHTML.replace(/<[^>]+>/g, '').trim();
      title = decodeHtmlEntities(title);
      
      let description = '';
      if (descMatch) {
        description = descMatch[1].replace(/<[^>]+>/g, '').trim();
        description = decodeHtmlEntities(description);
      }
      
      // Some titles might have an author prefix, but it's hard to parse generically. 
      // We will set author to "TheSunniWay" or try to extract from description if obvious.
      // We will just leave author as "" for now, or "TheSunniWay".
      
      books.push({
        title,
        slug: toSlug(title),
        author: 'TheSunniWay',
        description,
        language: 'English',
        category: 'English Ebooks',
        sub_category: category.name,
        pdf_url: `https://www.thesunniway.com${pdfPath}`,
        status: 'published'
      });
    }
  }
  
  console.log(`  Found ${books.length} books.`);
  return books;
}

async function main() {
  console.log('📚 Books Scraper Starting...\n');
  
  try {
    const categories = await fetchCategories();
    console.log(`Found ${categories.length} categories.`);
    
    let allBooks = [];
    
    for (const cat of categories) {
      await delay(1000);
      const books = await fetchBooksForCategory(cat);
      allBooks = allBooks.concat(books);
    }
    
    console.log(`\n📊 Scraping complete. Total books: ${allBooks.length}\n`);
    console.log('💾 Inserting into Supabase...\n');
    
    let inserted = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const book of allBooks) {
      try {
        // Ensure slug is unique, or skip if already exists
        const { data: existing } = await supabase
          .from('books')
          .select('id')
          .eq('slug', book.slug)
          .single();
          
        if (existing) {
          console.log(`  ⏭️  Skipping (already exists): "${book.title}"`);
          skipped++;
          continue;
        }
        
        const { error } = await supabase
          .from('books')
          .insert([book]);
          
        if (error) {
          if (error.code === '23505') {
            const modBook = { ...book, slug: book.slug + '-' + Date.now().toString().slice(-4) };
            const { error: error2 } = await supabase.from('books').insert([modBook]);
            if (error2) {
              console.error(`  ❌ Error inserting "${book.title}": ${error2.message}`);
              errors++;
            } else {
              console.log(`  ✅ Inserted (modified slug): "${book.title}"`);
              inserted++;
            }
          } else {
            console.error(`  ❌ Error inserting "${book.title}": ${error.message}`);
            errors++;
          }
        } else {
          console.log(`  ✅ Inserted: "${book.title}"`);
          inserted++;
        }
      } catch (err) {
        console.error(`  ❌ Exception for "${book.title}": ${err.message}`);
        errors++;
      }
    }
    
    console.log('\n🎉 Done!');
    console.log(`   ✅ Inserted: ${inserted}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();
