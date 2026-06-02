/**
 * Fix Aqaid Category Name
 * - Renames category "Aqaid" → "Aqā'id" in articles table
 * - Adds / updates the categories table entry
 * Run: node fix_aqaid_category.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const OLD_NAME = 'Aqaid';
const NEW_NAME = "Aqā'id";

async function main() {
  console.log(`🔄  Renaming category  "${OLD_NAME}"  →  "${NEW_NAME}"\n`);

  // ── 1. Update every article that has category = 'Aqaid' ──────────────────
  const { data: updated, error: artErr } = await supabase
    .from('articles')
    .update({ category: NEW_NAME })
    .eq('category', OLD_NAME)
    .select('id, title');

  if (artErr) {
    console.error('❌  Error updating articles:', artErr.message);
    process.exit(1);
  }
  console.log(`✅  Updated ${updated.length} articles to category "${NEW_NAME}"`);
  updated.forEach(a => console.log(`     • ${a.title}`));

  // ── 2. Update / insert in categories table ────────────────────────────────
  // Try to update existing row first
  const { data: existing } = await supabase
    .from('categories')
    .select('id, name')
    .eq('name', OLD_NAME)
    .maybeSingle();

  if (existing) {
    const { error: catErr } = await supabase
      .from('categories')
      .update({ name: NEW_NAME })
      .eq('id', existing.id);
    if (catErr) {
      console.error('\n❌  Error updating categories table:', catErr.message);
    } else {
      console.log(`\n✅  categories table row renamed  "${OLD_NAME}" → "${NEW_NAME}"`);
    }
  } else {
    // Row doesn't exist yet – insert it
    const { error: insErr } = await supabase
      .from('categories')
      .insert({ name: NEW_NAME, content_type: 'articles' });
    if (insErr) {
      // Might already exist with new name
      console.warn(`\n⚠️  Could not insert category (may already exist): ${insErr.message}`);
    } else {
      console.log(`\n✅  categories table: inserted "${NEW_NAME}"`);
    }
  }

  // ── 3. Verify ──────────────────────────────────────────────────────────────
  const { count } = await supabase
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('category', NEW_NAME);

  console.log(`\n🎉  Done!  ${count} article(s) now have category = "${NEW_NAME}"`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
