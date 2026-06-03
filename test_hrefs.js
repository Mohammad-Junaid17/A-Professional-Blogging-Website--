const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('articles_page.html', 'utf8');
const $ = cheerio.load(html);
$('a').each((i, el) => {
  console.log($(el).text().trim(), $(el).attr('href'));
});
