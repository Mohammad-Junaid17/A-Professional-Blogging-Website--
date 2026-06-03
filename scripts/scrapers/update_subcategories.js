const { createClient } = require('@supabase/supabase-js');
const cheerio = require('cheerio');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getItemsFromSubCategory(url, visited = new Set()) {
  if (visited.has(url)) return [];
  visited.add(url);
  
  const items = [];
  let currentUrl = url;
  
  while (currentUrl) {
    const html = await fetchHtml(currentUrl);
    if (!html) break;
    const $ = cheerio.load(html);
    
    $('.catItemTitle a').each((i, el) => {
      items.push($(el).text().trim());
    });
    
    const nextHref = $('a.next').attr('href');
    if (nextHref) {
      currentUrl = `https://www.thesunniway.com${nextHref}`;
      await delay(500);
    } else {
      currentUrl = null;
    }
  }
  return items;
}

async function run() {
  const categoriesToFix = [
    { url: 'https://www.thesunniway.com/articles/itemlist/category/35-fiqh', name: 'Fiqh' },
    { url: 'https://www.thesunniway.com/articles/itemlist/category/17-islamic-personalities', name: 'Islamic Personalities' }
  ];

  for (const cat of categoriesToFix) {
    const html = await fetchHtml(cat.url);
    if (!html) continue;
    const $ = cheerio.load(html);
    
    const subCats = [];
    $('.subCategory a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim().replace(/\s*\(\d+\)$/, '').trim();
      if (href && text && !text.includes('View items')) {
        subCats.push({ url: `https://www.thesunniway.com${href}`, name: text });
      }
    });

    // Deduplicate
    const uniqueSubCats = [...new Map(subCats.map(item => [item.url, item])).values()];
    
    for (const sub of uniqueSubCats) {
      console.log(`Processing subcategory: ${sub.name} (Parent: ${cat.name})`);
      const itemTitles = await getItemsFromSubCategory(sub.url);
      
      for (const title of itemTitles) {
        // Update database
        const { error } = await supabase
          .from('articles')
          .update({ sub_category: sub.name })
          .eq('category', cat.name)
          .eq('title', title);
          
        if (error) {
          console.error(`Error updating "${title}":`, error.message);
        } else {
          console.log(`✅ Updated "${title}" -> Subcategory: ${sub.name}`);
        }
      }
    }
  }
}

run();
