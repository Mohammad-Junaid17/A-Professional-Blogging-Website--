export const dynamic = 'force-dynamic';
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function GET(req: Request, props: { params: Promise<{ id: string  }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await verifyAdmin(false, 'books')
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { data, error } = await supabaseAdmin.from('books').select('*').eq('id', params.id).single()
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data })
}

export async function PUT(req: Request, props: { params: Promise<{ id: string  }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await verifyAdmin(false, 'books')
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const body = await req.json()
  const { data, error } = await supabaseAdmin.from('books').update(body).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  revalidatePath('/admin/books')
  revalidatePath('/books')
  return NextResponse.json({ data })
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string  }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await verifyAdmin(false, 'books')
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { error } = await supabaseAdmin.from('books').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  revalidatePath('/admin/books')
  revalidatePath('/books')
  return NextResponse.json({ success: true })
}
