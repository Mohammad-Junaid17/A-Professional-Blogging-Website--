/**
 * Scrape Related Articles from TheSunniWay
 * Creates src/data/aqaid_related.json
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase config
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Original hardcoded URLs from scrape_aqaid.js
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

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Convert url path to slug we use in DB
function extractSlug(urlPath) {
  const parts = urlPath.split('/');
  const last = parts[parts.length - 1];
  return last.replace(/^\d+-/, ''); // remove prefix id
}

// Helper functions (same as scrape_aqaid.js)
function decodeHtmlEntities(str) {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)).replace(/&[a-z]+;/gi, '');
}
function htmlToMarkdown(html) {
  if (!html) return '';
  let md = html;
  md = md.replace(/<script[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[\s\S]*?<\/style>/gi, '');
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n');
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<\/p>/gi, '\n\n');
  md = md.replace(/<p[^>]*>/gi, '');
  md = md.replace(/<ul[^>]*>/gi, '\n');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>/gi, '\n');
  md = md.replace(/<\/ol>/gi, '\n');
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n');
  md = md.replace(/<hr[^>]*>/gi, '\n---\n');
  md = md.replace(/<table[^>]*>/gi, '\n');
  md = md.replace(/<\/table>/gi, '\n');
  md = md.replace(/<tr[^>]*>/gi, '');
  md = md.replace(/<\/tr>/gi, '\n');
  md = md.replace(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi, '| $1 ');
  md = md.replace(/<[^>]+>/g, '');
  md = decodeHtmlEntities(md);
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();
  return md;
}
function estimateReadingTime(content) {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Map slug -> array of related slugs
const mappings = {};
const discoveredMissingArticles = [];

async function scrapeRelated() {
  console.log("Fetching related articles mappings...");
  
  // Track all known slugs to see if a related article is missing
  const allKnownUrls = new Set();
  for (const arr of Object.values(ARTICLES_BY_SUBCATEGORY)) {
    for (const art of arr) allKnownUrls.add(art.url);
  }

  for (const [subCategory, articles] of Object.entries(ARTICLES_BY_SUBCATEGORY)) {
    for (const article of articles) {
      const slug = extractSlug(article.url);
      const url = `https://www.thesunniway.com${article.url}`;
      console.log(`Checking ${slug}...`);
      
      try {
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (bot)' }});
        if (!response.ok) {
          console.warn(`Failed HTTP ${response.status}`);
          continue;
        }
        
        const html = await response.text();
        const relatedSlugs = [];
        
        // Find <div class="itemRelated"> block
        const relatedBlockMatch = html.match(/<div[^>]*class="[^"]*itemRelated[^"]*"[^>]*>([\s\S]*?)<\/ul>/i);
        if (relatedBlockMatch) {
          const linksMatch = relatedBlockMatch[1].matchAll(/<a[^>]*class="[^"]*itemRelTitle[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi);
          
          for (const match of linksMatch) {
            let relUrl = match[1];
            let relTitle = match[2].trim();
            // clean up URL if it is absolute
            if (relUrl.startsWith('http')) relUrl = new URL(relUrl).pathname;
            
            const relSlug = extractSlug(relUrl);
            relatedSlugs.push(relSlug);
            
            // Check if this article is in our known list, if not we must scrape it
            let isKnown = false;
            for (const knownUrl of allKnownUrls) {
              if (knownUrl.includes(relSlug)) { isKnown = true; break; }
            }
            if (!isKnown) {
              if (!discoveredMissingArticles.some(a => a.url === relUrl)) {
                discoveredMissingArticles.push({ url: relUrl, title: decodeHtmlEntities(relTitle) });
              }
            }
          }
        }
        
        mappings[slug] = relatedSlugs;
        
      } catch(e) {
        console.error("Err", e.message);
      }
      
      await delay(1000); // rate limit
    }
  }
  
  console.log("Missing Articles Discovered:", discoveredMissingArticles.length);
  for (const missing of discoveredMissingArticles) {
    console.log(`- Scrape missing: ${missing.title}`);
    await delay(2000);
    const mUrl = `https://www.thesunniway.com${missing.url}`;
    try {
       const response = await fetch(mUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (bot)' }});
       if (response.ok) {
         const html = await response.text();
         
         const contentMatch = html.match(/<div[^>]*class="[^"]*itemFullText[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div|<\/div>)/i);
         let content = "";
         if (contentMatch) {
           content = htmlToMarkdown(contentMatch[1]);
         }
         
         const excerptMatch = content.replace(/[#*_\[\]]/g, '').replace(/\n+/g, ' ').trim();
         const excerpt = excerptMatch.substring(0, 300) + (excerptMatch.length > 300 ? '...' : '');
         const mSlug = extractSlug(missing.url);
         
         // Insert into DB
         const { error } = await supabase.from('articles').insert([{
           title: missing.title,
           slug: mSlug,
           author: 'TheSunniWay',
           category: 'Aqā\'id',
           sub_category: 'Related', // Put it in Related sub-category
           content: content || `# ${missing.title}\n\nRead more on TheSunniWay.`,
           excerpt: excerpt || "Related article.",
           reading_time: estimateReadingTime(content)
         }]);
         
         if (error) {
           if (error.code === '23505') console.log(`  Already exists in DB: ${mSlug}`);
           else console.log(`  DB Error for ${mSlug}: ${error.message}`);
         } else {
           console.log(`  Successfully inserted: ${missing.title}`);
         }
       }
    } catch(e) {
      console.log(`Failed to fetch missing ${missing.url}`);
    }
  }

  // Save the mapping json
  const dataDir = path.join(__dirname, 'src', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'aqaid_related.json'), JSON.stringify(mappings, null, 2));
  
  console.log(`\nWrote JSON mappings for ${Object.keys(mappings).length} articles.`);
  console.log("Done.");
}

scrapeRelated();
