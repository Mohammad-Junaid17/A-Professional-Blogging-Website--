import { NextResponse } from "next/server";
export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  
  return NextResponse.json({
    serviceKeyPrefix: serviceKey.substring(0, 10),
    serviceKeyLength: serviceKey.length,
    anonKeyPrefix: anonKey.substring(0, 10),
    anonKeyLength: anonKey.length,
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL
  });
}
