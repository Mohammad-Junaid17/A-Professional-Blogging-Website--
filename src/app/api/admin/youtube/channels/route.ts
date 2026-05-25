export const dynamic = 'force-dynamic';
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { data, error } = await supabaseAdmin.from('youtube_channels').select('*')
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const body = await req.json()
  
  let { handle, channel_id } = body;
  
  // If channel_id is not provided, try to scrape it from the handle/URL
  if (!channel_id) {
    try {
      let targetUrl = handle;
      if (!targetUrl.startsWith('http')) {
        targetUrl = targetUrl.startsWith('@') ? `https://www.youtube.com/${targetUrl}` : `https://www.youtube.com/@${targetUrl}`;
      }
      
      const res = await fetch(targetUrl);
      if (res.ok) {
        const html = await res.text();
        // Look for the canonical channel URL or meta identifier
        const match = html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/);
        if (match && match[1]) {
          channel_id = match[1];
        } else {
          const fallbackMatch = html.match(/<meta itemprop="identifier" content="(UC[a-zA-Z0-9_-]{22})">/);
          if (fallbackMatch && fallbackMatch[1]) {
            channel_id = fallbackMatch[1];
          }
        }
      }
    } catch (e) {
      console.error("Failed to auto-fetch channel ID:", e);
    }
  }

  if (!channel_id) {
    return NextResponse.json({ error: 'Could not resolve Channel ID. Please provide it manually.' },{ status: 400 })
  }

  // Also extract a clean handle if a URL was provided
  if (handle.startsWith('http')) {
    const urlParts = handle.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart.startsWith('@')) {
      handle = lastPart;
    }
  }

  const { data, error } = await supabaseAdmin.from('youtube_channels').insert({ handle, channel_id }).select().single()
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data },{ status: 201 })
}

export async function DELETE(req: Request) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing ID' },{ status: 400 })
  const { error } = await supabaseAdmin.from('youtube_channels').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ success: true })
}
