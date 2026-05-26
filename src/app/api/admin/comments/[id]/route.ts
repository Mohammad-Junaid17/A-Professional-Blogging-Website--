export const dynamic = 'force-dynamic';
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, props: { params: Promise<{ id: string  }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await verifyAdmin(false, 'comments')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { action, admin_reply } = await req.json()
  
  const updates: Record<string, string> = {}
  if (action === 'approve') updates.status = 'approved'
  if (action === 'reject') updates.status = 'rejected'
  if (admin_reply !== undefined) updates.admin_reply = admin_reply

  const { data, error } = await supabaseAdmin.from('comments').update(updates).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string  }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await verifyAdmin(false, 'comments')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await supabaseAdmin.from('comments').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
