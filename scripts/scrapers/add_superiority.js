const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findArticle() {
  try {
    const url = 'https://www.thesunniway.com/search?searchword=Superiority+of+Siddiq+e+Akbar&searchphrase=all';
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Find the link to the item
    const articleLink = $('.result-title a').first().attr('href');
    if (!articleLink) {
      console.log('Could not find the article in search results.');
      return;
    }
    
    const fullUrl = 'https://www.thesunniway.com' + articleLink;
    console.log('Found URL:', fullUrl);
    
    // Fetch the article details
    const itemRes = await fetch(fullUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const itemHtml = await itemRes.text();
    const _$ = cheerio.load(itemHtml);
    
    const title = _$('.itemTitle').text().trim() || 'Superiority of Siddiq e Akbar';
    const desc = _$('.itemFullText').html() || _$('.itemIntroText').html() || '';
    
    // Convert to simple text for description
    const textDesc = _$('<div>').html(desc).text().trim();
    
    console.log('Title:', title);
    console.log('Description:', textDesc);
    
    // Determine the type based on the URL or breadcrumbs
    const isAudio = fullUrl.includes('/audio') || textDesc.toLowerCase().includes('speech');
    const table = isAudio ? 'lectures' : 'articles';
    
    // Insert into DB
    const { data, error } = await supabase.from(table).insert({
      title: title,
      description: textDesc,
      youtube_url: null, // Since we don't have the media URL right now
      scholar: 'Mufti Zahid Hussain Al-Qadri',
      category: isAudio ? 'Speeches' : 'Articles'
    }).select();
    
    if (error) console.error('Insert error:', error);
    else console.log(`Successfully added to ${table}:`, data[0].id);

  } catch (err) {
    console.error('Error:', err);
  }
}
findArticle();
