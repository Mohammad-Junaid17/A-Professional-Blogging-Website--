const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function normalizeTitle(t) {
  return t.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function fetchHtml(url) {
  try {
    const res = await fetch(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }, 
      signal: AbortSignal.timeout(10000) 
    });
    if (!res.ok) {
      if (res.status !== 404) console.log(`Error ${res.status} for ${url}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.log(`Fetch error for ${url}:`, err.message);
    return null;
  }
}

async function run() {
  const { data: dbArticles } = await supabase.from('articles').select('id, title, slug');
  const titleToSlug = new Map();
  for (const a of dbArticles) {
    titleToSlug.set(normalizeTitle(a.title), a.slug);
  }

  const relatedMap = {};
  const maxId = 400;
  const batchSize = 10;

  for (let start = 1; start <= maxId; start += batchSize) {
    console.log(`Processing IDs ${start} to ${start + batchSize - 1}...`);
    const promises = [];
    
    for (let id = start; id < start + batchSize; id++) {
      promises.push((async () => {
        const url = `https://www.thesunniway.com/articles/item/${id}`;
        const html = await fetchHtml(url);
        if (!html) return;
        
        const $ = cheerio.load(html);
        let title = $('title').text().trim().replace(/\n/g, '').trim();
        if (!title) {
          title = $('.itemTitle').text().trim().replace(/\n/g, '').trim();
        }
        if (!title) return;
        
        title = title.replace(/\s*-\s*TheSunniWay$/i, '');
        
        const sourceSlug = titleToSlug.get(normalizeTitle(title));
        if (!sourceSlug) return;
        
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
      })());
    }
    await Promise.all(promises);
  }
  
  fs.writeFileSync(path.join(__dirname, '../../src/data/all_related.json'), JSON.stringify(relatedMap, null, 2));
  console.log(`Saved related mapping for ${Object.keys(relatedMap).length} articles to src/data/all_related.json`);
}

run();
