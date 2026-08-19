export const dynamic = 'force-dynamic';
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

import { sendEmail } from '@/lib/mailer'

export async function PUT(req: Request, props: { params: Promise<{ id: string  }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await verifyAdmin(false, 'qa')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { action, answer, scholar, status: revertStatus, question } = body

  if (action === 'answer' || action === 'edit_answer') {
    if (!answer?.trim()) return NextResponse.json({ error: 'Answer is required' }, { status: 400 })
    
    // Check if this is an edit
    const isEdit = action === 'edit_answer';

    const updateData: any = {
      status: 'answered', admin_answer: answer, answered_by: scholar || 'Admin', answered_at: new Date().toISOString()
    }
    
    if (question) {
      updateData.question = question;
    }

    const { data, error } = await supabaseAdmin.from('qa_entries').update(updateData).eq('id', params.id).select().single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Send email notification
    if (data?.submitted_by) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('email').eq('id', data.submitted_by).single();
      
      if (profile?.email) {
        const subject = isEdit 
          ? 'Your Question Has Been Updated' 
          : 'Your Question Has Been Answered';
          
        const html = `
          <h3>Your Question:</h3>
          <p>${data.question}</p>
          <hr/>
          <h3>Scholar's Answer:</h3>
          <p>${data.admin_answer || data.answer}</p>
          <br/>
          <p>JazakAllah khayran for asking on our platform.</p>
        `;
        
        await sendEmail({
          to: profile.email,
          subject,
          html
        });
      }
    }

    return NextResponse.json({ data })
  }

  if (action === 'update') {
    const { title, question, category, answer, status, translationUrdu } = body
    const { data, error } = await supabaseAdmin.from('qa_entries').update({
      title,
      question,
      category,
      admin_answer: answer,
      answer,
      answered_by: scholar,
      status
    }).eq('id', params.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Upsert Urdu translation
    if (translationUrdu?.trim()) {
      const { data: existing } = await supabaseAdmin
        .from('translations')
        .select('id')
        .eq('content_type', 'qa')
        .eq('content_id', params.id)
        .eq('language', 'urdu')
        .single();

      if (existing) {
        await supabaseAdmin.from('translations').update({ content: translationUrdu.trim() }).eq('id', existing.id);
      } else {
        await supabaseAdmin.from('translations').insert({
          content_type: 'qa',
          content_id: params.id,
          language: 'urdu',
          content: translationUrdu.trim(),
        });
      }
    } else {
      // If cleared, delete existing translation
      await supabaseAdmin.from('translations').delete()
        .eq('content_type', 'qa')
        .eq('content_id', params.id)
        .eq('language', 'urdu');
    }

    return NextResponse.json({ data })
  }

  if (action === 'reject') {
    const { data, error } = await supabaseAdmin.from('qa_entries').update({ status: 'rejected' }).eq('id', params.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  if (action === 'revert') {
    const validStatuses = ['pending', 'answered', 'rejected']
    if (!validStatuses.includes(revertStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    const { data, error } = await supabaseAdmin.from('qa_entries').update({ status: revertStatus }).eq('id', params.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string  }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await verifyAdmin(false, 'qa')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await supabaseAdmin.from('qa_entries').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
