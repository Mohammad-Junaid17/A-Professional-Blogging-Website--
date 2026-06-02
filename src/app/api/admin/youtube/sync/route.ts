export const dynamic = 'force-dynamic';
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

// Utility to parse XML simply since we don't have a full XML parser library installed easily.
function extractTags(xml: string, tag: string) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g');
  const matches = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

export async function POST(req: Request) {
  // Allow manual sync via Admin Dashboard
  let isAuthorized = false;
  const session = await verifyAdmin(true);
  if (session) {
    isAuthorized = true;
  } else {
    // Allow automatic sync via Cron Job
    const authHeader = req.headers.get('authorization');
    if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })

  try {
    // 1. Get all channels
    const { data: channels, error: channelsError } = await supabaseAdmin.from('youtube_channels').select('*');
    if (channelsError) throw new Error(channelsError.message);
    if (!channels || channels.length === 0) return NextResponse.json({ message: "No channels configured." });

    let addedCount = 0;

    for (const channel of channels) {
      if (!channel.channel_id) continue;
      
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channel_id}`;
      const response = await fetch(feedUrl);
      if (!response.ok) {
        console.error(`Failed to fetch RSS for channel ${channel.channel_id}`);
        continue;
      }
      
      const xml = await response.text();
      const entries = xml.split('<entry>');
      entries.shift(); // Remove the header part before the first entry
      
      const maxToSync = 5;
      const entriesToProcess = entries.slice(0, maxToSync);
      
      for (const entry of entriesToProcess) {
        const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
        const titleMatch = entry.match(/<title>(.*?)<\/title>/);
        const authorMatch = entry.match(/<name>(.*?)<\/name>/);
        
        if (!videoIdMatch || !titleMatch) continue;
        
        const videoId = videoIdMatch[1];
        const title = titleMatch[1];
        const author = authorMatch ? authorMatch[1] : channel.handle;
        
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        const slug = videoId; // Use videoId as unique slug to avoid duplicates
        
        // Check if already exists by slug (which is videoId for synced videos)
        const { data: existing } = await supabaseAdmin.from('lectures').select('id').eq('slug', slug).single();
        if (existing) continue; // Already imported

        // Insert new lecture
        const { error: insertError } = await supabaseAdmin.from('lectures').insert({
          title: title,
          slug: slug,
          speaker: author,
          embed_url: embedUrl,
          category: 'YouTube Sync', // Default category
          description: `Automatically synced from ${author} YouTube channel.`
        });
        
        if (!insertError) {
          addedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, added: addedCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
