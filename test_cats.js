const cheerio = require('cheerio');

async function fetchHtml(url) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) return null;
    return await response.text();
  } catch (err) {
    console.error('fetch error', err);
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

extractCategories().then(console.log);
