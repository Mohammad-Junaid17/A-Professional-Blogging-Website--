const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fetchHtml(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) return null;
    return await response.text();
  } catch (err) {
    return null;
  }
}

function normalizeTitle(t) {
  return t.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function run() {
  const { data: dbArticles, error } = await supabase
    .from('articles')
    .select('id, title, slug');
    
  if (error) {
    console.error(error);
    return;
  }
  
  const titleToSlug = new Map();
  for (const a of dbArticles) {
    titleToSlug.set(normalizeTitle(a.title), a.slug);
  }

  const categories = [
    'https://www.thesunniway.com/aqa-id',
    'https://www.thesunniway.com/articles/itemlist/category/15-basics-about-islam',
    'https://www.thesunniway.com/articles/itemlist/category/35-fiqh',
    'https://www.thesunniway.com/articles/itemlist/category/16-islamic-events',
    'https://www.thesunniway.com/articles/itemlist/category/17-islamic-personalities',
    'https://www.thesunniway.com/articles/itemlist/category/14-sirah',
    'https://www.thesunniway.com/articles/itemlist/category/48-tasawwuf',
    'https://www.thesunniway.com/articles/itemlist/category/13-the-holy-quran'
  ];

  const articleLinks = new Set();
  
  async function fetchCategoryItems(catUrl, visited = new Set()) {
    if (visited.has(catUrl)) return;
    visited.add(catUrl);
    
    let currentUrl = catUrl;
    while (currentUrl) {
      console.log('Fetching category page:', currentUrl);
      const html = await fetchHtml(currentUrl);
      if (!html) break;
      
      const $ = cheerio.load(html);
      
      $('.catItemTitle a').each((i, el) => {
        const url = $(el).attr('href');
        if (url) {
          articleLinks.add(`https://www.thesunniway.com${url}`);
        }
      });
      
      $('.subCategory a').each((i, el) => {
        const url = $(el).attr('href');
        const text = $(el).text().trim();
        if (url && !text.includes('View items')) {
          fetchCategoryItems(`https://www.thesunniway.com${url}`, visited);
        }
      });
      
      const nextLink = $('.pagination-next a').attr('href');
      currentUrl = nextLink ? `https://www.thesunniway.com${nextLink}` : null;
    }
  }

  for (const cat of categories) {
    await fetchCategoryItems(cat);
  }
  
  console.log(`Found ${articleLinks.size} total article URLs to scan for related items.`);
  
  const relatedMap = {};
  
  let i = 0;
  for (const link of articleLinks) {
    i++;
    // console.log(`[${i}/${articleLinks.size}] Scanning ${link}`);
    const encodedLink = encodeURI(link);
    const html = await fetchHtml(encodedLink);
    if (!html) {
      console.log("Failed to fetch HTML for", link);
      continue;
    }
    const $ = cheerio.load(html);
    
    let title = $('title').text().trim().replace(/\n/g, '').trim();
    if (!title) {
      title = $('.itemTitle').text().trim().replace(/\n/g, '').trim();
    }
    if (!title) continue;
    
    // Remove " - TheSunniWay" if it's there
    title = title.replace(/\s*-\s*TheSunniWay$/i, '');
    
    const sourceSlug = titleToSlug.get(normalizeTitle(title));
    if (!sourceSlug) {
      // console.log("Missing source slug for:", title);
      continue;
    }
    
    const relatedTitles = [];
    $('.itemRelated ul li a').each((_, el) => {
      const text = $(el).text().trim();
      if (!text.toLowerCase().includes('audio') && !$(el).attr('href').toLowerCase().includes('audio')) {
        relatedTitles.push(text);
      }
    });
    
    if (relatedTitles.length > 0) {
      const relatedSlugs = [];
      for (const rt of relatedTitles) {
        const s = titleToSlug.get(normalizeTitle(rt));
        if (s) relatedSlugs.push(s);
      }
      if (relatedSlugs.length > 0) {
        relatedMap[sourceSlug] = relatedSlugs;
      }
    }
  }
  
  fs.writeFileSync(path.join(__dirname, '../../src/data/all_related.json'), JSON.stringify(relatedMap, null, 2));
  console.log(`Saved related mapping for ${Object.keys(relatedMap).length} articles to src/data/all_related.json`);
}

run();
