import { getSessionUser } from '@/lib/auth-helpers'
import { createRouteClient } from '@/lib/supabase-route-handler'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  const supabase = createRouteClient();

  if (type && id) {
    // Check if specific item is saved
    const { data, error } = await supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('content_type', type)
      .eq('content_id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is not found
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ isSaved: !!data });
  } else {
    // Fetch all saved items
    const { data, error } = await supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { content_type, content_id } = body;

  if (!content_type || !content_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createRouteClient();
  const { error } = await supabase
    .from('saved_items')
    .insert({
      user_id: user.id,
      content_type,
      content_id
    });

  if (error) {
    // Ignore duplicate key errors
    if (error.code === '23505') {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { content_type, content_id } = body;

  if (!content_type || !content_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createRouteClient();
  const { error } = await supabase
    .from('saved_items')
    .delete()
    .eq('user_id', user.id)
    .eq('content_type', content_type)
    .eq('content_id', content_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true }, { status: 200 });
}
