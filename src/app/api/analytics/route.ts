import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// We use the service role key so this API can insert rows without RLS policies getting in the way
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { path } = await req.json();
    
    // Get user agent for simple device tracking if needed later
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Insert the page view
    await supabase.from("page_views").insert({
      path,
      user_agent: userAgent,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
