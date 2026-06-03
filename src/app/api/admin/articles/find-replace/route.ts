export const dynamic = 'force-dynamic';
import { verifyAdmin } from '@/lib/auth-helpers';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

function countOccurrences(text: string, find: string, caseSensitive: boolean): number {
  if (!text || !find) return 0;
  const flags = caseSensitive ? 'g' : 'gi';
  const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (text.match(new RegExp(escaped, flags)) || []).length;
}

function replaceAll(text: string, find: string, replace: string, caseSensitive: boolean): string {
  if (!text || !find) return text;
  const flags = caseSensitive ? 'g' : 'gi';
  const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(escaped, flags), replace);
}

// POST /api/admin/articles/find-replace
// Body: { find, replace, caseSensitive, fields, preview }
//   preview: true  → returns matches without writing
//   preview: false → applies the replacement and writes to DB
export async function POST(req: Request) {
  const session = await verifyAdmin(false, 'articles');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { find, replace, caseSensitive = false, fields = ['content', 'excerpt', 'title'], preview = true } = await req.json();

  if (!find || find.trim() === '') {
    return NextResponse.json({ error: '"find" is required' }, { status: 400 });
  }

  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, title, content, excerpt');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const matches: { id: string; title: string; occurrences: number; fields: string[] }[] = [];

  for (const article of articles ?? []) {
    let totalOccurrences = 0;
    const matchedFields: string[] = [];

    for (const field of fields) {
      const text = (article as Record<string, string>)[field] ?? '';
      const count = countOccurrences(text, find, caseSensitive);
      if (count > 0) {
        totalOccurrences += count;
        matchedFields.push(field);
      }
    }

    if (totalOccurrences > 0) {
      matches.push({ id: article.id, title: article.title, occurrences: totalOccurrences, fields: matchedFields });
    }
  }

  if (preview) {
    return NextResponse.json({ matches, total: matches.reduce((s, m) => s + m.occurrences, 0) });
  }

  // Apply replacements
  let updated = 0;
  const errors: string[] = [];

  for (const match of matches) {
    const article = (articles ?? []).find(a => a.id === match.id)!;
    const patch: Record<string, string> = {};

    for (const field of match.fields) {
      patch[field] = replaceAll((article as Record<string, string>)[field] ?? '', find, replace, caseSensitive);
    }

    const { error: updateError } = await supabaseAdmin
      .from('articles')
      .update(patch)
      .eq('id', match.id);

    if (updateError) {
      errors.push(`${article.title}: ${updateError.message}`);
    } else {
      updated++;
    }
  }

  return NextResponse.json({
    success: true,
    updated,
    errors,
    message: `Replaced "${find}" → "${replace}" in ${updated} article${updated !== 1 ? 's' : ''}.`,
  });
}
