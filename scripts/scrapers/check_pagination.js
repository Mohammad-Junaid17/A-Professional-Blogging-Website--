async function run() {
  const response = await fetch('https://www.thesunniway.com/ifta/itemlist/category/31-salah', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)' }
  });
  const html = await response.text();
  const match = html.match(/<div class="k2Pagination">([\s\S]*?)<\/div>/i);
  if (match) {
    console.log(match[0]);
  } else {
    console.log("No pagination found!");
    // check alternative pagination class
    const match2 = html.match(/<div class="pagination">([\s\S]*?)<\/div>/i);
    if (match2) console.log("Alternative pagination:", match2[0]);
  }
}
run();
