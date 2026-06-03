// Cleanup script: removes Word plain-text artifacts from article content
// These appear when Word XML is copy-pasted as text (not as HTML tags)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * When Word documents are pasted, the XML/CSS metadata appears as raw text at
 * the beginning of the content, before the actual article text. It looks like:
 *
 *   Normal
 *   0
 *   false false false
 *   EN-IN JA AR-SA
 *   ... (lots of whitespace) ...
 *   /* Style Definitions *\/
 *   table.MsoNormalTable { mso-style-name:"Table Normal"; ... }
 *
 * We detect this block and strip everything up to (and including) the last
 * mso- CSS block, keeping only the real article content that follows.
 */
function stripWordTextArtifacts(content) {
  if (!content) return content;

  // Quick check — skip articles with no Word artifacts
  if (!/mso-/i.test(content)) return content;

  // Strategy: find the end of the mso CSS block (look for closing brace after mso- content)
  // The real content starts after the last closing brace of the style block
  // Pattern: everything before the real article text starts with Word metadata

  // Find the last occurrence of mso- related text in a style block
  // The style block ends with a closing brace `}`
  const msoBlockEnd = content.lastIndexOf('}');
  if (msoBlockEnd === -1) return content;

  // Everything after the last `}` is the real article content
  const realContent = content.substring(msoBlockEnd + 1).trimStart();

  // If we ended up with very little content, something went wrong — keep original
  if (realContent.length < 50) return content;

  return realContent;
}

// Fetch all articles that contain mso- artifacts
const { data: articles, error } = await supabase
  .from('articles')
  .select('id, title, content, excerpt')
  .ilike('content', '%mso-%');

if (error) { console.error('Fetch error:', error.message); process.exit(1); }

console.log(`Found ${articles?.length ?? 0} articles with Word artifacts\n`);

let fixed = 0;

for (const article of articles ?? []) {
  const cleanContent = stripWordTextArtifacts(article.content ?? '');
  const cleanExcerpt = stripWordTextArtifacts(article.excerpt ?? '');

  const changed =
    cleanContent !== (article.content ?? '') ||
    cleanExcerpt !== (article.excerpt ?? '');

  if (!changed) {
    console.log(`⏭  No change: ${article.title}`);
    continue;
  }

  console.log(`\nFixing: ${article.title}`);
  console.log('--- First 200 chars after clean ---');
  console.log(cleanContent.substring(0, 200));
  console.log('---');

  const { error: updateError } = await supabase
    .from('articles')
    .update({ content: cleanContent, excerpt: cleanExcerpt })
    .eq('id', article.id);

  if (updateError) {
    console.error(`❌ Failed: ${article.title} — ${updateError.message}`);
  } else {
    console.log(`✅ Fixed: ${article.title}`);
    fixed++;
  }
}

console.log(`\nDone. Fixed ${fixed} articles.`);
