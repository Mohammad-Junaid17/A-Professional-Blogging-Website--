import * as cheerio from 'cheerio';

async function test() {
  const url = "https://sunnahcentral.com/articles/fast/will-the-use-of-injection-while-fasting-nullify-the-fast";
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  console.log("Title: ", $('h1').text().trim());
  console.log("Article tag exists? ", $('article').length > 0);
  console.log("Main tag exists? ", $('main').length > 0);
  console.log("Root div has content? ", $('#root').text().trim().substring(0, 100));
}

test();
