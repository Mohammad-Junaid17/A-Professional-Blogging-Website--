import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

// We use the service role key so this API can insert rows without RLS policies getting in the way
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { path } = await req.json();

    // Server-side guard: never track admin or auth pages
    if (!path || path.startsWith("/admin") || path.startsWith("/auth") || path.startsWith("/api")) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Check if the current user is an admin or moderator
    const serverSupabase = await createServerClient();
    const { data: { session } } = await serverSupabase.auth.getSession();
    
    if (session?.user) {
      const { data: profile } = await serverSupabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
        
      if (profile && (profile.role === "admin" || profile.role === "moderator")) {
        // Skip tracking for admins and moderators
        return NextResponse.json({ success: true, ignored: true }, { status: 200 });
      }
    }
    
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
