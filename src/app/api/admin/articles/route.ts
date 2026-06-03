export const dynamic = 'force-dynamic';
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { stripWordHtml } from '@/lib/stripWordHtml'

export async function GET() {
  const session = await verifyAdmin(false, 'articles')
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { data, error } = await supabaseAdmin.from('articles').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const session = await verifyAdmin(false, 'articles')
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const body = await req.json();
  const { title, slug, author, category, sub_category, reading_time, status } = body;
  const excerpt = stripWordHtml(body.excerpt);
  const content = stripWordHtml(body.content);
  const { data, error } = await supabaseAdmin.from('articles').insert([{
    title, slug, author, category, sub_category, reading_time, excerpt, content, status
  }]).select().single()
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data },{ status: 201 })
}
