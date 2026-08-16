export const dynamic = 'force-dynamic';
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await verifyAdmin(false, 'qa')
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { data, error } = await supabaseAdmin.from('qa_entries').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const session = await verifyAdmin(false, 'qa')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { title, question, category, answer, answered_by, translationUrdu } = await req.json()

    if (!title || !question || !category || !answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) + "-" + Date.now().toString(36);

    const { data, error } = await supabaseAdmin.from('qa_entries').insert({
      title,
      question,
      category,
      answer: answer,
      admin_answer: answer,
      answered_by: answered_by || 'Admin',
      status: 'answered',
      slug,
      submitted_by: session.user.id
    }).select().single()

    if (error) throw error

    const qaId = data.id;
    const translationsToInsert = [];
    
    if (translationUrdu?.trim()) {
      translationsToInsert.push({
        content_type: 'qa',
        content_id: qaId,
        language: 'urdu',
        content: translationUrdu.trim(),
      });
    }
    
    if (translationsToInsert.length > 0) {
      const { error: transErr } = await supabaseAdmin.from('translations').insert(translationsToInsert);
      if (transErr) console.error("Error inserting translations:", transErr);
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await verifyAdmin(false, 'qa')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  if (action === 'delete_all_rejected') {
    const { error } = await supabaseAdmin.from('qa_entries').delete().eq('status', 'rejected')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
