export const dynamic = 'force-dynamic';
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { stripWordHtml } from '@/lib/stripWordHtml'

export async function GET(req: Request, props: { params: Promise<{ id: string  }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await verifyAdmin(false, 'articles')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabaseAdmin.from('articles').select('*').eq('id', params.id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PUT(req: Request, props: { params: Promise<{ id: string  }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await verifyAdmin(false, 'articles')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json();
  const { title, slug, author, category, sub_category, reading_time, status, translationUrdu } = body;
  const excerpt = stripWordHtml(body.excerpt);
  const content = stripWordHtml(body.content);

  const updates: any = {
    title, slug, author, category, sub_category, reading_time, excerpt, content, status
  };

  const { data, error } = await supabaseAdmin.from('articles').update(updates).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Upsert Urdu translation
  if (translationUrdu?.trim()) {
    const { data: existing } = await supabaseAdmin
      .from('translations')
      .select('id')
      .eq('content_type', 'article')
      .eq('content_id', params.id)
      .eq('language', 'urdu')
      .single();

    if (existing) {
      await supabaseAdmin.from('translations').update({ content: translationUrdu.trim() }).eq('id', existing.id);
    } else {
      await supabaseAdmin.from('translations').insert({
        content_type: 'article',
        content_id: params.id,
        language: 'urdu',
        content: translationUrdu.trim(),
      });
    }
  } else {
    await supabaseAdmin.from('translations').delete()
      .eq('content_type', 'article')
      .eq('content_id', params.id)
      .eq('language', 'urdu');
  }

  return NextResponse.json({ data })
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string  }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await verifyAdmin(false, 'articles')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await supabaseAdmin.from('articles').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
