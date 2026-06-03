const cheerio = require('cheerio');

async function debugUrl() {
  const link = "https://www.thesunniway.com/articles/itemlist/category/18-sahaba";
  const res = await fetch(link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  $('.catItemTitle a').each((i, el) => {
    console.log("Title:", $(el).text().trim());
    console.log("URL:", $(el).attr('href'));
  });
}

debugUrl();
