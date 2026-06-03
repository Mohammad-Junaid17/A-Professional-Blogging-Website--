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

function extractScholar(answerText) {
  if (!answerText) return "TheSunniWay";
  
  const tail = answerText.slice(-600); // Check the last 600 chars just in case
  
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

  // General "Answered by" pattern
  match = tail.match(/Answered by[\s:]*([^\n]+)/i);
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
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)' },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) return null;
    return await response.text();
  } catch (err) {
    return null;
  }
}

async function extractCategories() {
  const html = await fetchHtml('https://www.thesunniway.com/ifta');
  if (!html) return [];
  const regex = /<a href="(\/ifta\/itemlist\/category\/[^"]+)">([^<]+)<\/a>/gi;
  const categories = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    let url = match[1];
    let name = decodeHtmlEntities(match[2].trim()).replace(/\s*\(\d+\)$/, '');
    categories.push({ url: `https://www.thesunniway.com${url}`, name });
  }
  return [...new Map(categories.map(item => [item.url, item])).values()];
}

async function fetchCategoryItems(catUrl) {
  const items = [];
  let currentUrl = catUrl;
  
  while (currentUrl) {
    const html = await fetchHtml(currentUrl);
    if (!html) break;
    
    const $ = cheerio.load(html);
    
    $('.catItemTitle a').each((i, el) => {
      const url = $(el).attr('href');
      const title = $(el).text().trim();
      items.push({ url: `https://www.thesunniway.com${url}`, title });
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

async function main() {
  console.log('🔄 Starting Re-Scrape to fix truncated answers and extract all scholars...\n');
  
  const categories = await extractCategories();
  
  let totalUpdated = 0;
  
  for (const cat of categories) {
    const items = await fetchCategoryItems(cat.url);
    console.log(`📂 Found ${items.length} items in ${cat.name}`);
    
    for (const item of items) {
      await delay(1000);
      
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
      const scholar = extractScholar(markdown);
      
      const { error } = await supabase
        .from('qa_entries')
        .update({ answer: markdown, answered_by: scholar })
        .eq('question', item.title);
        
      if (error) {
        console.error(`❌ Error updating "${item.title}":`, error.message);
      } else {
        console.log(`✅ Updated: "${item.title}" (Scholar: ${scholar})`);
        totalUpdated++;
      }
    }
  }

  console.log(`\n🎉 Re-Scraping Complete! Updated ${totalUpdated} entries.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
