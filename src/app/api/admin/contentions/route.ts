export const dynamic = 'force-dynamic';
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await verifyAdmin(false, 'contentions')
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { data, error } = await supabaseAdmin.from('contentions').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const session = await verifyAdmin(false, 'contentions')
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const body = await req.json();
  const { translationUrdu, ...rest } = body;
  const insertData = { ...rest, created_by: session.user.id };
  const { data, error } = await supabaseAdmin.from('contentions').insert(insertData).select().single()
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })

  if (translationUrdu?.trim() && data) {
    await supabaseAdmin.from('translations').insert({
      content_type: 'contention',
      content_id: data.id,
      language: 'urdu',
      content: translationUrdu.trim(),
    });
  }

  return NextResponse.json({ data },{ status: 201 })
}
