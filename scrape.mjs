import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// We require the service role key to bypass RLS for inserting, or we rely on anon if RLS is loose
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const turndownService = new TurndownService();

function getCategoryFromUrl(url) {
  const parts = url.split('/');
  if (parts.length >= 5 && parts[3] === 'articles') {
    return parts[4].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  return 'General';
}

async function scrape() {
  console.log("Fetching sitemap...");
  const sitemapRes = await fetch("https://sunnahcentral.com/sitemap.xml");
  const sitemapText = await sitemapRes.text();
  
  const urls = [];
  const regex = /<loc>(https:\/\/sunnahcentral\.com\/articles\/.*?)<\/loc>/g;
  let match;
  while ((match = regex.exec(sitemapText)) !== null) {
    urls.push(match[1]);
  }
  
  console.log(`Found ${urls.length} articles to scrape.`);
  
  for (const url of urls) {
    console.log(`\nScraping: ${url}`);
    try {
      const res = await fetch(url);
      const html = await res.text();
      const $ = cheerio.load(html);
      
      const title = $('h1').first().text().trim();
      const category = getCategoryFromUrl(url);
      
      let $content = $('article');
      if ($content.length === 0) {
        $content = $('main');
      }
      
      if ($content.length === 0) {
        console.log(`Skipping ${url} - no article/main tag found.`);
        continue;
      }
      
      // Remove H1 from content to avoid duplication
      $content.find('h1').remove();
      
      // Extract author from the last 10 lines
      let author = 'SunnahCentral';
      const rawTextLines = $content.text().split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const lastLines = rawTextLines.slice(-10);
      
      for (const line of lastLines) {
        const lower = line.toLowerCase();
        if (lower.startsWith('by ') || lower.startsWith('translated by ') || lower.startsWith('name:')) {
          author = line.trim();
          break;
        }
      }
      
      // Convert HTML to Markdown
      let markdown = turndownService.turndown($content.html());
      
      // Generate a slug from the title
      let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      // Append the text as requested
      markdown += "\n\n*Taken from SunnahCentral*";
      
      const { error } = await supabase.from('qa_entries').insert({
        question: title,
        slug: slug,
        answer: markdown,
        category: category,
        answered_by: author
      });
      
      if (error) {
        console.error(`DB Error for ${title}:`, error.message);
      } else {
        console.log(`Successfully inserted: ${title}`);
      }
      
      // Delay to be polite to the server
      await new Promise(r => setTimeout(r, 300));
      
    } catch (e) {
      console.error(`Failed to scrape ${url}:`, e);
    }
  }
  
  console.log("\nDone scraping!");
}

scrape();
