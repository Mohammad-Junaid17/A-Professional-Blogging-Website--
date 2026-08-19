import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 })
    }

    // Check if the user owns this question and it's older than 3 days
    const { data: qa, error: fetchError } = await supabaseAdmin
      .from('qa_entries')
      .select('id, submitted_by, created_at, status')
      .eq('id', id)
      .single()

    if (fetchError || !qa) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    if (qa.submitted_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to remind this question' }, { status: 403 })
    }

    if (qa.status !== 'pending') {
      return NextResponse.json({ error: 'Question is not pending' }, { status: 400 })
    }

    if (qa.reminded_at) {
      const daysSinceReminder = Math.floor((new Date().getTime() - new Date(qa.reminded_at).getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceReminder < 3) {
        return NextResponse.json({ error: 'You recently sent a reminder. Please wait 72 hours before sending another.' }, { status: 400 })
      }
    }

    // Update reminded_at
    const { error: updateError } = await supabaseAdmin
      .from('qa_entries')
      .update({ reminded_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating reminder:', updateError)
      return NextResponse.json({ error: 'Failed to update reminder' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reminder route error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
