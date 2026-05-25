export const dynamic = 'force-dynamic';
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, props: { params: Promise<{ id: string  }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await verifyAdmin(true)
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { action } = await req.json()
  const updates: Record<string, string | boolean> = {}
  if (action === 'make_admin') updates.role = 'admin'
  if (action === 'make_moderator') updates.role = 'moderator'
  if (action === 'make_user') updates.role = 'user'
  if (action === 'disable') updates.disabled = true
  if (action === 'enable') updates.disabled = false

  const { data, error } = await supabaseAdmin.from('profiles').update(updates).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data })
}
