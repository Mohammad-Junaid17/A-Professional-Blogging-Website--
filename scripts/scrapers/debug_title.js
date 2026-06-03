const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function normalizeTitle(t) {
  return t.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function debugUrl(link) {
  const { data: dbArticles } = await supabase.from('articles').select('id, title, slug');
  const titleToSlug = new Map();
  for (const a of dbArticles) {
    titleToSlug.set(normalizeTitle(a.title), a.slug);
  }

  const encodedLink = encodeURI(link);
  console.log("Fetching:", encodedLink);
  const res = await fetch(encodedLink, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  console.log("Status:", res.status);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  let title = $('title').text().trim().replace(/\n/g, '').trim();
  if (!title) {
    title = $('.itemTitle').text().trim().replace(/\n/g, '').trim();
  }
  
  title = title.replace(/\s*-\s*TheSunniWay$/i, '');
  
  console.log("Extracted Title:", title);
  console.log("Normalized Title:", normalizeTitle(title));
  
  const sourceSlug = titleToSlug.get(normalizeTitle(title));
  console.log("Source Slug found in DB:", sourceSlug);
  
  const relatedTitles = [];
  $('.itemRelated ul li a').each((_, el) => {
    const text = $(el).text().trim();
    if (!text.toLowerCase().includes('audio') && !$(el).attr('href').toLowerCase().includes('audio')) {
      relatedTitles.push(text);
    }
  });
  
  console.log("Filtered related titles:", relatedTitles);
  
  for (const rt of relatedTitles) {
    const s = titleToSlug.get(normalizeTitle(rt));
    console.log(`    Mapped "${rt}" to slug: ${s}`);
  }
}

debugUrl("https://www.thesunniway.com/articles/item/246-hadith-it-is-wajib-obligatory-upon-my-ummah-to-love-abu-bakr");
