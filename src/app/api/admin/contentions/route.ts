export const dynamic = 'force-dynamic';
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { data, error } = await supabaseAdmin.from('contentions').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const body = await req.json()
  const { data, error } = await supabaseAdmin.from('contentions').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data },{ status: 201 })
}
