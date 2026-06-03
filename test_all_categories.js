const cheerio = require('cheerio');

async function run() {
  const res = await fetch('https://www.thesunniway.com/articles', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  console.log("Categories found on /articles:");
  $('.subCategory a').each((i, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr('href');
    if (!text.includes('View items')) {
      console.log(`- ${text} (${href})`);
    }
  });
}
run();
