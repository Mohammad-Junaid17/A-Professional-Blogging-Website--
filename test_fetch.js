const fs = require('fs');
async function run() {
  const res = await fetch('https://www.thesunniway.com/articles', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    }
  });
  console.log('Status:', res.status);
  const text = await res.text();
  fs.writeFileSync('articles_page.html', text);
}
run();
