export const dynamic = 'force-dynamic';
import { verifyAdmin } from '@/lib/auth-helpers';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { stripWordHtml } from '@/lib/stripWordHtml';

export async function POST() {
  const session = await verifyAdmin(false, 'articles');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch all articles
  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, title, content, excerpt');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const fixed: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  for (const article of articles ?? []) {
    const cleanContent = stripWordHtml(article.content ?? '');
    const cleanExcerpt = stripWordHtml(article.excerpt ?? '');

    const changed =
      cleanContent !== (article.content ?? '') ||
      cleanExcerpt !== (article.excerpt ?? '');

    if (!changed) {
      skipped.push(article.title);
      continue;
    }

    const { error: updateError } = await supabaseAdmin
      .from('articles')
      .update({ content: cleanContent, excerpt: cleanExcerpt })
      .eq('id', article.id);

    if (updateError) {
      errors.push(`${article.title}: ${updateError.message}`);
    } else {
      fixed.push(article.title);
    }
  }

  return NextResponse.json({
    summary: `Fixed ${fixed.length} articles, skipped ${skipped.length} clean articles, ${errors.length} errors.`,
    fixed,
    errors,
  });
}
