/**
 * Ifta Scraper
 * Fetches Ifta items from thesunniway.com and inserts into Supabase qa_entries table.
 * Run: node scrape_ifta.js
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase config - read from .env.local
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to create a slug from a title
function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

// Convert HTML to basic Markdown
function htmlToMarkdown(html) {
  if (!html) return '';
  let md = html;
  md = md.replace(/<script[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[\s\S]*?<\/style>/gi, '');
  md = md.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, '**$1**\n\n');
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<\/p>/gi, '\n\n');
  md = md.replace(/<p[^>]*>/gi, '');
  md = md.replace(/<ul[^>]*>/gi, '\n');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>/gi, '\n');
  md = md.replace(/<\/ol>/gi, '\n');
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n');
  md = md.replace(/<hr[^>]*>/gi, '\n---\n');
  md = md.replace(/<[^>]+>/g, '');
  md = decodeHtmlEntities(md);
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
}

function decodeHtmlEntities(str) {
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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchHtml(url) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)' },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) return null;
    return await response.text();
  } catch (err) {
    console.warn(`  ⚠️  Failed to fetch ${url}: ${err.message}`);
    return null;
  }
}

async function extractCategories() {
  console.log('Fetching main Ifta page...');
  const html = await fetchHtml('https://www.thesunniway.com/ifta');
  if (!html) return [];
  
  const regex = /<a href="(\/ifta\/itemlist\/category\/[^"]+)">([^<]+)<\/a>/gi;
  const categories = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    let url = match[1];
    let nameWithCount = match[2].trim();
    nameWithCount = decodeHtmlEntities(nameWithCount);
    let name = nameWithCount.replace(/\s*\(\d+\)$/, '');
    categories.push({ url: `https://www.thesunniway.com${url}`, name });
  }
  
  // Deduplicate
  const uniqueCats = [];
  const seen = new Set();
  for (const c of categories) {
    if (!seen.has(c.url)) {
      seen.add(c.url);
      uniqueCats.push(c);
    }
  }
  return uniqueCats;
}

async function fetchCategoryItems(catUrl) {
  const items = [];
  let currentUrl = catUrl;
  let page = 1;
  
  while (currentUrl) {
    console.log(`  Fetching page ${page}: ${currentUrl}`);
    const html = await fetchHtml(currentUrl);
    if (!html) break;
    
    // Extract items
    const itemRegex = /<h3 class="catItemTitle">\s*<a href="([^"]+)">([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = itemRegex.exec(html)) !== null) {
      let url = match[1];
      let title = decodeHtmlEntities(match[2].trim().replace(/<[^>]+>/g, ''));
      items.push({ url: `https://www.thesunniway.com${url}`, title });
    }
    
    // Check for next page
    const nextRegex = /<a[^>]*class="next"[^>]*href="([^"]+)"/i;
    const nextMatch = nextRegex.exec(html);
    if (nextMatch) {
      currentUrl = `https://www.thesunniway.com${decodeHtmlEntities(nextMatch[1])}`;
      page++;
      await delay(1000);
    } else {
      currentUrl = null;
    }
  }
  
  return items;
}

async function fetchItemDetails(itemUrl) {
  const html = await fetchHtml(itemUrl);
  if (!html) return null;
  
  const contentMatch = html.match(/<div[^>]*class="[^"]*itemFullText[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div|<\/div>)/i)
    || html.match(/<div[^>]*class="[^"]*item-page[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div class="pager|<!-- End)/i)
    || html.match(/id="itemFullText[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    
  let content = '';
  if (contentMatch) {
    content = htmlToMarkdown(contentMatch[1]);
  } else {
    // Fallback
    const bodyMatch = html.match(/<div[^>]*class="[^"]*itemBody[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class="[^"]*itemSocialSharing/i);
    if (bodyMatch) {
      content = htmlToMarkdown(bodyMatch[1]);
    }
  }
  
  return content;
}

async function main() {
  console.log('🕌 Ifta Scraper Starting...\n');
  
  const categories = await extractCategories();
  console.log(`Found ${categories.length} categories.`);
  
  let totalInserted = 0;
  let totalSkipped = 0;
  
  for (const cat of categories) {
    console.log(`\n📂 Processing Category: ${cat.name}`);
    
    // Insert category into DB if it doesn't exist
    const { data: existingCat } = await supabase
      .from('categories')
      .select('id')
      .eq('name', cat.name)
      .eq('content_type', 'qa')
      .single();
      
    if (!existingCat) {
      await supabase.from('categories').insert({ name: cat.name, content_type: 'qa' });
      console.log(`  Added new category to DB: ${cat.name}`);
    }

    const items = await fetchCategoryItems(cat.url);
    console.log(`  Found ${items.length} items in ${cat.name}.`);
    
    for (const item of items) {
      await delay(1500); // polite rate limit
      
      const slug = toSlug(item.title);
      
      // Check if exists
      const { data: existing } = await supabase
        .from('qa_entries')
        .select('id')
        .eq('slug', slug)
        .single();
        
      if (existing) {
        console.log(`  ⏭️  Skipping (exists): "${item.title}"`);
        totalSkipped++;
        continue;
      }
      
      const content = await fetchItemDetails(item.url);
      if (!content) {
        console.log(`  ❌ Failed to fetch content for: ${item.title}`);
        continue;
      }
      
      const { error } = await supabase
        .from('qa_entries')
        .insert({
          question: item.title,
          answer: content,
          category: cat.name,
          slug: slug,
          status: 'answered',
          scholar: 'Mufti Zahid Hussain al-Qadri'
        });
        
      if (error) {
        // Fallback slug
        const fallbackSlug = slug + '-' + Math.floor(Math.random() * 1000);
        const { error: err2 } = await supabase.from('qa_entries').insert({
          question: item.title,
          answer: content,
          category: cat.name,
          slug: fallbackSlug,
          status: 'answered',
          scholar: 'Mufti Zahid Hussain al-Qadri'
        });
        if (err2) {
          console.error(`  ❌ Error inserting "${item.title}": ${err2.message}`);
        } else {
          console.log(`  ✅ Inserted (modified slug): "${item.title}"`);
          totalInserted++;
        }
      } else {
        console.log(`  ✅ Inserted: "${item.title}"`);
        totalInserted++;
      }
    }
  }

  console.log('\n🎉 Ifta Scraping Complete!');
  console.log(`   ✅ Inserted: ${totalInserted}`);
  console.log(`   ⏭️  Skipped: ${totalSkipped}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
