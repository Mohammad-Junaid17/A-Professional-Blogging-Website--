export const dynamic = 'force-dynamic';
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await verifyAdmin(false, 'comments')
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { data, error } = await supabaseAdmin.from('comments').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data })
}
