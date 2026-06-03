const { createClient } = require('@supabase/supabase-js');
const cheerio = require('cheerio');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (match, href, text) => {
    if (href.startsWith('/')) href = 'https://www.thesunniway.com' + href;
    return `[${text}](${href})`;
  });
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
  md = md.replace(/<[^>]+>/g, ''); // strip remaining tags
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

function extractAuthor(text) {
  if (!text) return "TheSunniWay";
  
  const tail = text.slice(-800); // look at the end
  
  // Translator pattern
  let match = tail.match(/\[?Translated by\]?[\s:]*([^\n]+)/i);
  if (match) {
    let name = match[1].replace(/\*|_/g, '').trim();
    if (name) return "Translated by " + name;
  }
  
  // Specific Scholars based on Sunnway site
  if (tail.match(/(?:Faqeer\s+)?Zahid Hus(?:s)?ain/i)) return "Mufti Zahid Hussain Al-Qadri";
  if (tail.match(/Mufti Sufyan Qadri/i)) return "Mufti Sufyan Qadri";
  if (tail.match(/Muhammad Junaid Raza/i)) return "Muhammad Junaid Raza";
  if (tail.match(/Muhammad Kalim/i)) return "Muhammad Kalim (Preston, UK)";
  if (tail.match(/Sayed/i) && tail.match(/Asad al-Qadiri/i)) return "Sayyid Mawlana Asad al-Qadiri";
  if (tail.match(/Asad al-Qadiri/i)) return "Mawlana Asad al-Qadiri";
  if (tail.match(/Salman Nuri/i)) return "Mawlana Salman Nuri";
  if (tail.match(/Awais/i) && tail.match(/Tariq/i)) return "Muhammad Awais Tariq";
  if (tail.match(/Aqib/i) && tail.match(/Qadri/i)) return "Muhammad Aqib Farid Qadri";
  if (tail.match(/Zubair/i) && tail.match(/Husain/i)) return "Zubair Husain";
  if (tail.match(/Abu Hasan/i)) return "Abu Hasan";

  match = tail.match(/(?:Written by|Author|By)[\s:]*([^\n]+)/i);
  if (match) {
    return match[1].replace(/\*|_/g, '').trim();
  }
  
  return "TheSunniWay";
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchHtml(url) {
  try {
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) return null;
    return await response.text();
  } catch (err) {
    return null;
  }
}

async function extractCategories() {
  const html = await fetchHtml('https://www.thesunniway.com/articles');
  if (!html) return [];
  const $ = cheerio.load(html);
  const categories = [];
  
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href) {
      let name = null;
      if (href.includes('/articles/itemlist/category/15-')) name = "Basics about Islam";
      else if (href.includes('/articles/itemlist/category/35-')) name = "Fiqh";
      else if (href.includes('/articles/itemlist/category/16-')) name = "Islamic Events";
      else if (href.includes('/articles/itemlist/category/17-')) name = "Islamic Personalities";
      else if (href.includes('/articles/itemlist/category/14-')) name = "Sirah";
      else if (href.includes('/articles/itemlist/category/13-')) name = "The Holy Qur'an";
      
      if (name) {
        categories.push({ url: `https://www.thesunniway.com${href}`, name });
      }
    }
  });
  return [...new Map(categories.map(item => [item.url, item])).values()];
}

async function fetchCategoryItems(catUrl, visited = new Set()) {
  if (visited.has(catUrl)) return [];
  visited.add(catUrl);
  
  const items = [];
  let currentUrl = catUrl;
  
  // Get all items in this category page (and paginated pages)
  while (currentUrl) {
    const html = await fetchHtml(currentUrl);
    if (!html) break;
    
    const $ = cheerio.load(html);
    
    $('.catItemTitle a').each((i, el) => {
      const url = $(el).attr('href');
      const title = $(el).text().trim();
      items.push({ url: `https://www.thesunniway.com${url}`, title });
    });
    
    // Find subcategories on the first page
    if (currentUrl === catUrl) {
      const subCats = [];
      $('.subCategory a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && !href.includes('View items')) {
          subCats.push(`https://www.thesunniway.com${href}`);
        }
      });
      // Deduplicate subcategories
      const uniqueSubCats = [...new Set(subCats)];
      for (const subCat of uniqueSubCats) {
        const subItems = await fetchCategoryItems(subCat, visited);
        items.push(...subItems);
      }
    }
    
    const nextHref = $('a.next').attr('href');
    if (nextHref) {
      currentUrl = `https://www.thesunniway.com${nextHref}`;
      await delay(500);
    } else {
      currentUrl = null;
    }
  }
  
  // Deduplicate items
  const uniqueItemsMap = new Map();
  for (const item of items) {
    uniqueItemsMap.set(item.url, item);
  }
  
  return Array.from(uniqueItemsMap.values());
}

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log('🔄 Starting scrape for requested article categories...\n');
  
  const categories = await extractCategories();
  
  if (categories.length === 0) {
    console.log('❌ Could not find target categories on /articles page.');
    return;
  }
  
  let totalInserted = 0;
  
  for (const cat of categories) {
    const items = await fetchCategoryItems(cat.url);
    console.log(`📂 Found ${items.length} items in ${cat.name}`);
    
    for (const item of items) {
      await delay(1000); // Polite scraping delay
      
      const html = await fetchHtml(item.url);
      if (!html) {
        console.log(`❌ Failed to fetch: ${item.title}`);
        continue;
      }
      
      const $ = cheerio.load(html);
      const innerHtml = $('.itemFullText').html() || $('.item-page').html() || $('#itemFullText').html();
      
      if (!innerHtml) {
        console.log(`⚠️  Could not find content body for: ${item.title}`);
        continue;
      }
      
      const markdown = htmlToMarkdown(innerHtml);
      const author = extractAuthor(markdown);
      const slug = generateSlug(item.title) + '-' + Math.random().toString(36).substring(2, 6);
      const excerpt = markdown.substring(0, 150).replace(/\n/g, ' ') + '...';
      
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('title', item.title)
        .maybeSingle();
        
      if (existing) {
        console.log(`⏭️  Skipping existing: "${item.title}"`);
        continue;
      }
      
      const { error } = await supabase
        .from('articles')
        .insert({
          title: item.title,
          slug: slug,
          content: markdown,
          excerpt: excerpt,
          author: author,
          category: cat.name,
          status: 'published'
        });
        
      if (error) {
        console.error(`❌ Error inserting "${item.title}":`, error.message);
      } else {
        console.log(`✅ Inserted: "${item.title}" (Author: ${author})`);
        totalInserted++;
      }
    }
  }

  console.log(`\n🎉 Scraping Complete! Successfully added ${totalInserted} articles.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
