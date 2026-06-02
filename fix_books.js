/**
 * Fix Books Script
 * Updates the books that were imported with category "English Ebooks"
 * 1. Resolves the PDF direct link by following the PhocaDownload redirect
 * 2. Changes `category` to be the actual category (previously in `sub_category`)
 * 3. Adds the categories to the `categories` table
 * Run: node fix_books.js
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

async function resolveDirectPdfUrl(path) {
  // path is like /ebooks/english/file/39-a-just-reply-to-a-biased-author
  const match = path.match(/\/file\/(\d+)-/);
  if (!match) return path; // fallback
  
  const id = match[1];
  const url = `https://www.thesunniway.com/index.php?option=com_phocadownload&view=category&download=${id}`;
  
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'manual' });
    if (res.status === 302 || res.status === 303 || res.status === 301) {
      const location = res.headers.get('location');
      if (location) {
        // location might be relative or absolute
        if (location.startsWith('http')) {
          return location;
        } else {
          return `https://www.thesunniway.com${location.startsWith('/') ? '' : '/'}${location}`;
        }
      }
    }
  } catch (err) {
    console.error('Error resolving URL for ID', id, err);
  }
  
  return `https://www.thesunniway.com${path}`;
}

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔧 Fixing books...\n');
  
  const { data: books, error } = await supabase
    .from('books')
    .select('*')
    .eq('category', 'English Ebooks');
    
  if (error) {
    console.error('Error fetching books:', error);
    process.exit(1);
  }
  
  console.log(`Found ${books.length} books to update.`);
  
  const uniqueCategories = new Set();
  
  for (const book of books) {
    const originalPdfUrl = book.pdf_url;
    // Extract path: remove https://www.thesunniway.com
    const path = originalPdfUrl.replace('https://www.thesunniway.com', '');
    
    console.log(`Resolving PDF for: ${book.title}`);
    const directUrl = await resolveDirectPdfUrl(path);
    console.log(`  -> ${directUrl}`);
    
    const properCategory = book.sub_category;
    uniqueCategories.add(properCategory);
    
    const { error: updateError } = await supabase
      .from('books')
      .update({
        pdf_url: directUrl,
        category: properCategory,
        sub_category: ''
      })
      .eq('id', book.id);
      
    if (updateError) {
      console.error(`  ❌ Failed to update book ${book.id}:`, updateError.message);
    }
    
    await delay(300); // polite delay
  }
  
  console.log('\n📁 Updating categories table...\n');
  for (const catName of uniqueCategories) {
    if (!catName) continue;
    
    // Check if exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('content_type', 'books')
      .eq('title', catName)
      .single();
      
    if (!existing) {
      const { error: insertError } = await supabase
        .from('categories')
        .insert({
          title: catName,
          slug: toSlug(catName),
          content_type: 'books'
        });
        
      if (insertError) {
        console.error(`  ❌ Failed to insert category "${catName}":`, insertError.message);
      } else {
        console.log(`  ✅ Inserted category: ${catName}`);
      }
    } else {
      console.log(`  ⏭️  Category already exists: ${catName}`);
    }
  }
  
  console.log('\n🎉 Done fixing books!');
}

main();
