const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
const TurndownService = require('turndown');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

async function fetchHtml(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function scrapeTasawwuf() {
  const catUrl = 'https://www.thesunniway.com/articles/itemlist/category/48-tasawwuf';
  
  const items = [];
  const html = await fetchHtml(catUrl);
  if (!html) return;
  const $ = cheerio.load(html);
  
  $('.catItemTitle a').each((i, el) => {
    const url = $(el).attr('href');
    const title = $(el).text().trim();
    items.push({ url: `https://www.thesunniway.com${url}`, title });
  });
  
  console.log(`Found ${items.length} items in Tasawwuf.`);
  
  for (const item of items) {
    const itemHtml = await fetchHtml(item.url);
    if (!itemHtml) continue;
    const $item = cheerio.load(itemHtml);
    
    $item('.itemFullText img').each((i, el) => {
      const src = $item(el).attr('src');
      if (src && !src.startsWith('http')) {
        $item(el).attr('src', `https://www.thesunniway.com${src}`);
      }
    });
    
    let fullText = $item('.itemFullText').html() || $item('.itemIntroText').html() || '';
    if (!fullText) continue;
    
    let author = 'TheSunniWay';
    const bottomText = $item('.itemFullText p').last().text().trim();
    if (bottomText.match(/^(Translated|Author|By|Mufti|Mawlana|Imam|Shaykh)/i)) {
      author = bottomText;
    }

    const markdown = turndownService.turndown(fullText);
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
        category: 'Tasawwuf',
        status: 'published'
      });
      
    if (error) {
      console.error(`Error inserting "${item.title}":`, error.message);
    } else {
      console.log(`✅ Inserted: "${item.title}" (Author: ${author})`);
    }
    
    // Add to categories DB if needed
    const { error: catErr } = await supabase
      .from('categories')
      .upsert({ name: 'Tasawwuf', content_type: 'articles' }, { onConflict: 'name,content_type' })
      .select();
  }
}
scrapeTasawwuf();
