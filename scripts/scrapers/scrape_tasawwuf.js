/**
 * Tasawwuf Article Scraper
 * Fetches Tasawwuf articles from thesunniway.com and inserts into Supabase articles table.
 * Run: node scrape_tasawwuf.js
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase config - read from .env.local
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// All Tasawwuf articles
const TASAWWUF_ARTICLES = [
  { url: '/articles/item/241-satanic-whispers-and-their-cures-part-1', title: 'Satanic Whispers and their Cures - Part 1' },
  { url: '/articles/item/201-the-secret-behind-the-lifting-of-the-finger', title: 'The Secret Behind the Lifting of the Finger' },
  { url: '/articles/item/194-secrets-pertaining-to-the-times-of-salah', title: 'Secrets Pertaining to the Times of Salah' }
];

// Helper to create a slug from a title
function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

// Fetch and parse an article from TheSunniWay
async function fetchArticle(path) {
  const url = `https://www.thesunniway.com${path}`;
  console.log(`  Fetching: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)',
      },
      signal: AbortSignal.timeout(30000),
    });
    
    if (!response.ok) {
      console.warn(`  ⚠️  HTTP ${response.status} for ${url}`);
      return null;
    }
    
    const html = await response.text();
    return parseArticleHtml(html, path);
  } catch (err) {
    console.warn(`  ⚠️  Failed to fetch ${url}: ${err.message}`);
    return null;
  }
}

// Parse HTML to extract article content
function parseArticleHtml(html, path) {
  // Extract title
  const titleMatch = html.match(/<h2[^>]*class="[^"]*itemTitle[^"]*"[^>]*>([\s\S]*?)<\/h2>/i) 
    || html.match(/<title>(.*?)<\/title>/i);
  let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
  // Remove site name suffix
  title = title.replace(/\s*\|\s*TheSunniWay.*$/, '').trim();
  // Decode HTML entities
  title = decodeHtmlEntities(title);

  // Extract the main article content - look for itemFullText div
  const contentMatch = html.match(/<div[^>]*class="[^"]*itemFullText[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div|<\/div>)/i)
    || html.match(/<div[^>]*class="[^"]*item-page[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div class="pager|<!-- End)/i)
    || html.match(/id="itemFullText[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

  let content = '';
  if (contentMatch) {
    // Convert HTML to clean text/markdown
    content = htmlToMarkdown(contentMatch[1]);
  } else {
    // Fallback: grab content area
    const bodyMatch = html.match(/<section[^>]*id="content"[^>]*>([\s\S]*?)<\/section>/i);
    if (bodyMatch) {
      // Remove navigation, header elements
      let bodyHtml = bodyMatch[1]
        .replace(/<div[^>]*class="[^"]*catItemLinks[^"]*"[\s\S]*?<\/div>/gi, '')
        .replace(/<div[^>]*class="[^"]*catItemHeader[^"]*"[\s\S]*?<\/div>/gi, '');
      content = htmlToMarkdown(bodyHtml);
    }
  }

  // Generate excerpt (first 300 chars of content)
  const plainText = content.replace(/[#*_\[\]]/g, '').replace(/\n+/g, ' ').trim();
  const excerpt = plainText.substring(0, 300) + (plainText.length > 300 ? '...' : '');

  // Extract slug from path
  const pathParts = path.split('/');
  const lastPart = pathParts[pathParts.length - 1];
  // Remove the number prefix (e.g., "5-the-effect..." → "the-effect...")
  const slug = lastPart.replace(/^\d+-/, '');

  return { title, content, excerpt, slug };
}

// Convert HTML to basic Markdown
function htmlToMarkdown(html) {
  if (!html) return '';
  
  let md = html;
  
  // Remove script and style tags
  md = md.replace(/<script[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[\s\S]*?<\/style>/gi, '');
  
  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n');
  
  // Bold and italic
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
  
  // Links - keep as markdown links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  
  // Line breaks and paragraphs
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<\/p>/gi, '\n\n');
  md = md.replace(/<p[^>]*>/gi, '');
  
  // Lists
  md = md.replace(/<ul[^>]*>/gi, '\n');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>/gi, '\n');
  md = md.replace(/<\/ol>/gi, '\n');
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  
  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n');
  
  // HR
  md = md.replace(/<hr[^>]*>/gi, '\n---\n');
  
  // Tables (basic)
  md = md.replace(/<table[^>]*>/gi, '\n');
  md = md.replace(/<\/table>/gi, '\n');
  md = md.replace(/<tr[^>]*>/gi, '');
  md = md.replace(/<\/tr>/gi, '\n');
  md = md.replace(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi, '| $1 ');
  
  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  md = decodeHtmlEntities(md);
  
  // Clean up whitespace
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();
  
  return md;
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&[a-z]+;/gi, '');
}

// Estimate reading time (avg 200 words/min)
function estimateReadingTime(content) {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Small delay to be respectful to the server
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🕌 Tasawwuf Article Scraper Starting...\n');
  
  const allArticles = [];
  let totalFetched = 0;
  let totalFailed = 0;

  console.log(`\n📂 Fetching Tasawwuf articles...`);
  
  for (const articleInfo of TASAWWUF_ARTICLES) {
    await delay(1500); // Be respectful - 1.5s between requests
    
    const parsed = await fetchArticle(articleInfo.url);
    
    if (!parsed) {
      // If fetch failed, use the known title and create placeholder content
      console.log(`  ⚠️  Using title-only fallback for: ${articleInfo.title}`);
      const slug = articleInfo.url.split('/').pop().replace(/^\d+-/, '');
      allArticles.push({
        title: articleInfo.title,
        slug: toSlug(articleInfo.title),
        author: 'TheSunniWay',
        category: 'Tasawwuf',
        excerpt: `An article on ${articleInfo.title} from The Sunni Way.`,
        content: `# ${articleInfo.title}\n\n*Source: [TheSunniWay](https://www.thesunniway.com${articleInfo.url})*\n\nPlease visit the original article at TheSunniWay for the full content.`,
        reading_time: 3,
        status: 'published'
      });
      totalFailed++;
      continue;
    }

    // Use the scraped title if available, otherwise use the known title
    const finalTitle = parsed.title && parsed.title.length > 5 ? parsed.title : articleInfo.title;
    const finalSlug = parsed.slug || toSlug(finalTitle);
    const finalContent = parsed.content && parsed.content.length > 50 
      ? parsed.content 
      : `# ${finalTitle}\n\n*Source: [TheSunniWay](https://www.thesunniway.com${articleInfo.url})*\n\nPlease visit the original article at TheSunniWay for the full content.`;
    const finalExcerpt = parsed.excerpt && parsed.excerpt.length > 10 
      ? parsed.excerpt 
      : `An article about ${finalTitle} from The Sunni Way - Tasawwuf section.`;

    allArticles.push({
      title: finalTitle,
      slug: finalSlug,
      author: 'TheSunniWay',
      category: 'Tasawwuf',
      excerpt: finalExcerpt.substring(0, 500),
      content: finalContent,
      reading_time: estimateReadingTime(finalContent),
      status: 'published'
    });
    
    console.log(`  ✅ "${finalTitle}" (${estimateReadingTime(finalContent)} min read)`);
    totalFetched++;
  }

  console.log(`\n📊 Scraping complete: ${totalFetched} fetched, ${totalFailed} fallbacks`);
  console.log(`📝 Total articles to insert: ${allArticles.length}\n`);

  // Now insert into Supabase
  console.log('💾 Inserting into Supabase...\n');
  
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const article of allArticles) {
    try {
      // Check if article with this slug already exists
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', article.slug)
        .single();
      
      if (existing) {
        console.log(`  ⏭️  Skipping (already exists): "${article.title}"`);
        skipped++;
        continue;
      }

      const { error } = await supabase
        .from('articles')
        .insert([article]);
      
      if (error) {
        // If slug conflict, try with a modified slug
        if (error.code === '23505') {
          const modifiedArticle = { ...article, slug: article.slug + '-tasawwuf' };
          const { error: error2 } = await supabase.from('articles').insert([modifiedArticle]);
          if (error2) {
            console.error(`  ❌ Error inserting "${article.title}": ${error2.message}`);
            errors++;
          } else {
            console.log(`  ✅ Inserted (modified slug): "${article.title}"`);
            inserted++;
          }
        } else {
          console.error(`  ❌ Error inserting "${article.title}": ${error.message}`);
          errors++;
        }
      } else {
        console.log(`  ✅ Inserted: "${article.title}"`);
        inserted++;
      }
    } catch (err) {
      console.error(`  ❌ Exception for "${article.title}": ${err.message}`);
      errors++;
    }
  }

  console.log('\n🎉 Done!');
  console.log(`   ✅ Inserted: ${inserted}`);
  console.log(`   ⏭️  Skipped (duplicates): ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
