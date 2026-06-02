/**
 * Aqaid Article Scraper
 * Fetches all articles from thesunniway.com/aqa-id and inserts into Supabase articles table.
 * Run: node scrape_aqaid.js
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

// All article URLs organized by category (sub_category)
// Category = "Aqaid", sub_category = each subcategory name
const ARTICLES_BY_SUBCATEGORY = {
  'Mawlid': [
    { url: '/aqa-id/item/5-the-effect-of-observing-mawlid-on-disbelievers', title: 'The Effect of Observing Mawlid on Disbelievers' },
    { url: '/aqa-id/item/4-hadīth-4-mawlid-un-nabī-şallallāhu-álayhi-wa-sallam', title: 'Hadīth 4: Mawlid Un-Nabī ﷺ' },
    { url: '/aqa-id/item/3-hadīth-3-mawlid-un-nabī-şallallāhu-álayhi-wa-sallam', title: 'Hadīth 3: Mawlid Un-Nabī ﷺ' },
    { url: '/aqa-id/item/2-hadīth-2-mawlid-un-nabī-şallallāhu-álayhi-wa-sallam', title: 'Hadīth 2: Mawlid Un-Nabī ﷺ' },
    { url: '/aqa-id/item/1-hadith-1-mawlid-un-nabī-şallallāhu-álayhi-wa-sallam', title: 'Hadith 1: Mawlid Un-Nabī ﷺ' },
  ],
  'Knowledge of the Unseen': [
    { url: '/aqa-id/item/7-the-knowledge-of-the-unseen-ilm-al-ghayb-of-the-messenger-of-allah', title: "The Knowledge of the Unseen ('Ilm al-Ghayb) of the Messenger of Allah ﷺ" },
    { url: '/aqa-id/item/6-imam-ghazali-on-the-knowledge-of-the-unseen', title: "Imam al-Ghazali on the Knowledge of the Unseen" },
  ],
  'Deobandism': [
    { url: '/aqa-id/item/17-sayyid-ahmad-saeed-kazmi-issue-of-takfeer-ruling-someone-as-an-apostate', title: 'Sayyid Ahmad Saeed Kazmi: Issue of Takfeer [Ruling Someone as an Apostate]' },
    { url: '/aqa-id/item/16-the-deobandi-faith-murdered', title: 'The Deobandi Faith Murdered!' },
    { url: '/aqa-id/item/15-reasons-for-a-strict-stance-against-the-deobandi-sect', title: 'Reasons for a Strict Stance against the Deobandi Sect' },
    { url: '/aqa-id/item/14-al-muhannad-ala-al-mufannad', title: 'al-Muhannad ala al-Mufannad' },
    { url: "/aqa-id/item/13-an-interesting-example-of-deobandis'-hypocrisy", title: "An Interesting Example of Deobandis' Hypocrisy" },
    { url: '/aqa-id/item/12-deobandi-lie-branding-others-as-disbelievers', title: 'Deobandi Lie - Branding Others as Disbelievers' },
  ],
  'Wahaabism': [
    { url: '/aqa-id/item/266-message-to-muslims-about-isis', title: 'Message to Muslims about ISIS' },
    { url: '/aqa-id/item/20-nikah-performed-by-a-wahābī', title: 'Nikah Performed by a Wahābī' },
    { url: '/aqa-id/item/19-salāt-al-janāzah-funeral-prayer-of-a-wahābī', title: 'Salāt al-Janāzah (Funeral Prayer) of a Wahābī' },
    { url: '/aqa-id/item/18-did-the-wahabi-sect-exist-at-the-time-of-the-khulafaa-e-rashideen?', title: 'Did the Wahabi Sect Exist at the Time of the Khulafaa-e-Rashideen? (II)' },
    { url: '/aqa-id/item/11-qiyam', title: 'Qiyam' },
    { url: '/aqa-id/item/10-did-the-wahabi-sect-exist-at-the-time-of-the-khulafaa-e-rashideen?', title: 'Did the Wahabi Sect Exist at the Time of the Khulafaa-e-Rashideen? (I)' },
    { url: '/aqa-id/item/9-a-very-great-fitna-would-have-been-removed-from-this-ummah', title: '...A Very Great Fitna Would Have Been Removed from This Ummah' },
    { url: '/aqa-id/item/8-wahaabism-and-its-refutation-by-the-ahl-as-sunnah', title: 'Wahaabism and its Refutation by The Ahl as-Sunnah' },
  ],
  'Messenger of Allah': [
    { url: '/aqa-id/item/297-the-sanctuary-of-solace-on-the-etiquette-of-visiting-our-master-muhammad', title: 'The Sanctuary of Solace: On the Etiquette of Visiting Our Master Muhammad ﷺ' },
    { url: '/aqa-id/item/183-how-to-respond-to-blasphemous-film-by-taajush-shariah', title: "How to Respond to Blasphemous Film - by Taajush Shari'ah" },
    { url: '/aqa-id/item/132-method-of-achieving-ziyārah-of-the-beloved-master-sayyidunā-rasūlullāh-şallallāhu-álayhi-wa-sallam', title: 'Method of Achieving Ziyārah of the Beloved Master Sayyidunā Rasūlullāh ﷺ' },
    { url: '/aqa-id/item/29-the-shadowless-prophet--the-aqīdah-of-sayyidina-uthman-ghanī-radiyallahu-taala-anhu', title: "The Shadowless Prophet: The 'Aqīdah of Sayyidina Uthman Ghanī رضي الله عنه" },
    { url: '/aqa-id/item/28-imam-al-suyuti-penned-seven-works-defending-the-blessed-parents-of-the-prophet-upon-him-and-them-blessings-and-peace', title: 'Imam al-Suyuti Penned Seven Works Defending the Blessed Parents of the Prophet ﷺ' },
    { url: '/aqa-id/item/27-iman-is-respect-for-the-rasul-sallallahu-alayhi-wa-sallam', title: 'Iman is Respect for the Rasul ﷺ' },
    { url: '/aqa-id/item/26-invoke-blessings-on-the-prophet\'s-şallallāhu-álayhi-wa-sallam-name', title: "Invoke Blessings on the Prophet's ﷺ Name" },
    { url: '/aqa-id/item/25-hadith-emphasizing-to-increase-our-love-for-allah-almighty-and-his-beloved-messenger-sallallahu-alayhi-wa-sallam', title: 'Hadith Emphasizing to Increase Our Love for Allah Almighty and His Beloved Messenger ﷺ' },
    { url: '/aqa-id/item/24-the-prophet-sallallahu-alayhi-wa-sallam-is-alive', title: 'The Prophet ﷺ is Alive' },
    { url: '/aqa-id/item/23-the-prophet-sallallahu-alayhi-wa-sallam-sees-and-hears', title: 'The Prophet ﷺ Sees and Hears' },
    { url: '/aqa-id/item/22-light-of-the-beloved-messenger-sallallahu-alayhi-wa-sallam', title: 'Light of the Beloved Messenger ﷺ' },
    { url: '/aqa-id/item/21-intercession-of-the-prophet-sallallahu-alayhi-wa-sallam', title: 'Intercession of the Prophet ﷺ' },
  ],
  'Tawassul': [
    { url: '/aqa-id/item/35-tawassul-intercession-through-the-pious', title: 'Tawassul: Intercession Through the Pious' },
    { url: '/aqa-id/item/34-tawassul-the-view-of-ibn-taymiyyah', title: 'Tawassul: The View of Ibn Taymiyyah' },
    { url: '/aqa-id/item/33-tawassul-quranic-evidence', title: 'Tawassul: Quranic Evidence' },
    { url: '/aqa-id/item/32-tawassul-hadith-evidence', title: 'Tawassul: Hadith Evidence' },
  ],
  "Kissing of the Thumbs": [
    { url: '/aqa-id/item/40-kissing-of-the-thumbs', title: 'Kissing of the Thumbs Upon Hearing the Blessed Name of the Messenger ﷺ' },
  ],
  'Miscellaneous': [
    { url: '/aqa-id/item/50-celebrating-anniversaries', title: 'Celebrating Anniversaries' },
    { url: '/aqa-id/item/45-is-it-permissible-to-celebrate-birthdays', title: 'Is it Permissible to Celebrate Birthdays?' },
  ],
  "Shi'a": [
    { url: '/aqa-id/item/55-refutation-of-shia', title: "Refutation of Tafdili and Raafdi Shi'ites" },
  ],
};

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
  console.log('🕌 Aqaid Article Scraper Starting...\n');
  
  const allArticles = [];
  let totalFetched = 0;
  let totalFailed = 0;

  for (const [subCategory, articles] of Object.entries(ARTICLES_BY_SUBCATEGORY)) {
    console.log(`\n📂 Subcategory: ${subCategory} (${articles.length} articles)`);
    
    for (const articleInfo of articles) {
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
          category: 'Aqaid',
          sub_category: subCategory,
          excerpt: `An article on ${articleInfo.title} from The Sunni Way.`,
          content: `# ${articleInfo.title}\n\n*Source: [TheSunniWay](https://www.thesunniway.com${articleInfo.url})*\n\nPlease visit the original article at TheSunniWay for the full content.`,
          reading_time: 3,
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
        : `An article about ${finalTitle} from The Sunni Way - Aqaid section.`;

      allArticles.push({
        title: finalTitle,
        slug: finalSlug,
        author: 'TheSunniWay',
        category: 'Aqaid',
        sub_category: subCategory,
        excerpt: finalExcerpt.substring(0, 500),
        content: finalContent,
        reading_time: estimateReadingTime(finalContent),
      });
      
      console.log(`  ✅ "${finalTitle}" (${estimateReadingTime(finalContent)} min read)`);
      totalFetched++;
    }
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
          const modifiedArticle = { ...article, slug: article.slug + '-aqaid' };
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
