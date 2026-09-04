export const dynamic = 'force-dynamic';
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, props: { params: Promise<{ id: string  }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await verifyAdmin(false, 'contentions')
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const body = await req.json()
  const { translationUrdu, ...rest } = body;
  const { data, error } = await supabaseAdmin.from('contentions').update(rest).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })

  if (translationUrdu?.trim()) {
    const { data: existing } = await supabaseAdmin.from('translations').select('id').eq('content_type', 'contention').eq('content_id', id).eq('language', 'urdu').single();
    if (existing) {
      await supabaseAdmin.from('translations').update({ content: translationUrdu.trim() }).eq('id', existing.id);
    } else {
      await supabaseAdmin.from('translations').insert({
        content_type: 'contention',
        content_id: id,
        language: 'urdu',
        content: translationUrdu.trim(),
      });
    }
  }

  return NextResponse.json({ data })
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string  }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await verifyAdmin(false, 'contentions')
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { error } = await supabaseAdmin.from('contentions').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ success: true })
}
