const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function searchSunniWay(queryStr) {
  const url = `https://www.thesunniway.com/search?searchword=${encodeURIComponent(queryStr)}&searchphrase=all`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const results = [];
  $('.search-results dt.result-title a').each((i, el) => {
    results.push({
      title: $(el).text().trim(),
      url: `https://www.thesunniway.com${$(el).attr('href')}`
    });
  });
  console.log("Search Results for", queryStr, ":", results);
}

searchSunniWay("Hadith: It is wajib (obligatory) upon my Ummah");
