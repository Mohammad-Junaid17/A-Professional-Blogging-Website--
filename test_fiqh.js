const cheerio = require('cheerio');
async function run() {
  const res = await fetch('https://www.thesunniway.com/articles/itemlist/category/35-fiqh', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  console.log("Articles directly in Fiqh:");
  $('.catItemTitle a').each((i, el) => {
    console.log($(el).text().trim());
  });
  
  console.log("\nSubcategories in Fiqh:");
  $('.subCategory a').each((i, el) => {
    console.log($(el).text().trim(), $(el).attr('href'));
  });
}
run();
