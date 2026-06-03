const cheerio = require('cheerio');

async function run() {
  const res = await fetch('https://www.thesunniway.com/articles/item/357-wudhu-before-eating-does-away-with-destitution', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  // Find related items
  console.log("Related items HTML:");
  const related = $('.itemRelated');
  console.log(related.html() ? related.html().substring(0, 1000) : "No .itemRelated found");
}
run();
