const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

function write(filePath, content) {
    const fullPath = path.join(rootDir, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
    console.log(`Created: ${filePath}`);
}

// 1. .env.local
write('.env.local', `
NEXT_PUBLIC_SUPABASE_URL=https://sfptgsaaqvgqsjiomkfs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcHRnc2FhcXZncXNqaW9ta2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDM3MzMsImV4cCI6MjA5NTExOTczM30.UpAw8P_klxMoN1oBjHYBEscmoVr5owtt5H7dPEs-EVI
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_tHnpKEk2PyInDknXHAFdYg_p_QHjPhS
SUPABASE_SERVICE_ROLE_KEY=sb_secret_whDLq4ZhMO-udkcu6drPhQ_NrAJsenI
`);

// 2. .gitignore
const gitignorePath = path.join(rootDir, '.gitignore');
let gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
const ignores = ['.env.local', '.env', '.env*.local', 'node_modules/', '.next/'];
ignores.forEach(ignore => {
    if (!gitignore.includes(ignore)) gitignore += `\n${ignore}`;
});
fs.writeFileSync(gitignorePath, gitignore.trim() + '\n');
console.log('Updated: .gitignore');

// 3. lib/supabase.ts
write('src/lib/supabase.ts', `
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://sfptgsaaqvgqsjiomkfs.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcHRnc2FhcXZncXNqaW9ta2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDM3MzMsImV4cCI6MjA5NTExOTczM30.UpAw8P_klxMoN1oBjHYBEscmoVr5owtt5H7dPEs-EVI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
`);

// 4. lib/supabase-admin.ts
write('src/lib/supabase-admin.ts', `
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  'https://sfptgsaaqvgqsjiomkfs.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'sb_secret_whDLq4ZhMO-udkcu6drPhQ_NrAJsenI',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
`);

// 5. lib/supabase-server.ts
write('src/lib/supabase-server.ts', `
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerClient = () =>
  createServerComponentClient({
    cookies,
    supabaseUrl: 'https://sfptgsaaqvgqsjiomkfs.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcHRnc2FhcXZncXNqaW9ta2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDM3MzMsImV4cCI6MjA5NTExOTczM30.UpAw8P_klxMoN1oBjHYBEscmoVr5owtt5H7dPEs-EVI'
  })
`);

// 6. lib/supabase-route-handler.ts
write('src/lib/supabase-route-handler.ts', `
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createRouteClient = () =>
  createRouteHandlerClient({
    cookies,
    supabaseUrl: 'https://sfptgsaaqvgqsjiomkfs.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcHRnc2FhcXZncXNqaW9ta2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDM3MzMsImV4cCI6MjA5NTExOTczM30.UpAw8P_klxMoN1oBjHYBEscmoVr5owtt5H7dPEs-EVI'
  })
`);

// 7. lib/auth-helpers.ts
write('src/lib/auth-helpers.ts', `
import { createRouteClient } from './supabase-route-handler'
import { supabaseAdmin } from './supabase-admin'

export async function verifyAdmin() {
  const supabase = createRouteClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  return profile?.role === 'admin' ? session : null
}

export async function getSession() {
  const supabase = createRouteClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
`);

// 8. middleware.ts
write('src/middleware.ts', `
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient(
    { req, res },
    {
      supabaseUrl: 'https://sfptgsaaqvgqsjiomkfs.supabase.co',
      supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcHRnc2FhcXZncXNqaW9ta2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDM3MzMsImV4cCI6MjA5NTExOTczM30.UpAw8P_klxMoN1oBjHYBEscmoVr5owtt5H7dPEs-EVI'
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth')

  if (isAdminRoute) {
    if (!session) return NextResponse.redirect(new URL('/auth/signin', req.url))
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
    if (profile?.role !== 'admin') return NextResponse.redirect(new URL('/', req.url))
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*']
}
`);

// API Routes
const resources = ['articles', 'books', 'scholars', 'quotes', 'proofs', 'contentions', 'lectures', 'newsletter', 'settings'];

resources.forEach(res => {
  write(`src/app/api/admin/${res}/route.ts`, `
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { data, error } = await supabaseAdmin.from('${res === 'newsletter' ? 'newsletter_subscribers' : res === 'settings' ? 'site_settings' : res}').select('*').order(res === 'settings' ? 'key' : 'created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const body = await req.json()
  const { data, error } = await supabaseAdmin.from('${res === 'newsletter' ? 'newsletter_subscribers' : res === 'settings' ? 'site_settings' : res}').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data },{ status: 201 })
}
  `);

  if (res !== 'settings' && res !== 'newsletter') {
    write(`src/app/api/admin/${res}/[id]/route.ts`, `
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const body = await req.json()
  const { data, error } = await supabaseAdmin.from('${res}').update(body).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { error } = await supabaseAdmin.from('${res}').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ success: true })
}
    `);
  }
});

// QA Routes
write('src/app/api/admin/qa/route.ts', `
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { data, error } = await supabaseAdmin.from('qa_entries').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data })
}
`);

write('src/app/api/admin/qa/[id]/route.ts', `
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { action, answer, scholar } = await req.json()

  if (action === 'answer') {
    if (!answer?.trim()) return NextResponse.json({ error: 'Answer is required' }, { status: 400 })
    const { data, error } = await supabaseAdmin.from('qa_entries').update({
      status: 'answered', admin_answer: answer, answered_by: scholar || 'Admin', answered_at: new Date().toISOString()
    }).eq('id', params.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  if (action === 'reject') {
    const { data, error } = await supabaseAdmin.from('qa_entries').update({ status: 'rejected' }).eq('id', params.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
`);

// Comments Routes
write('src/app/api/admin/comments/route.ts', `
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { data, error } = await supabaseAdmin.from('comments').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data })
}
`);

write('src/app/api/admin/comments/[id]/route.ts', `
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { action } = await req.json()
  const status = action === 'approve' ? 'approved' : 'rejected'
  const { data, error } = await supabaseAdmin.from('comments').update({ status }).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data })
}
`);

// Users Routes
write('src/app/api/admin/users/route.ts', `
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { data, error } = await supabaseAdmin.from('profiles').select('*, comments:comments(count), questions:qa_entries(count)').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data })
}
`);

write('src/app/api/admin/users/[id]/route.ts', `
import { verifyAdmin } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' },{ status: 401 })
  const { action } = await req.json()
  const updates: Record<string, any> = {}
  if (action === 'make_admin') updates.role = 'admin'
  if (action === 'make_user') updates.role = 'user'
  if (action === 'disable') updates.disabled = true
  if (action === 'enable') updates.disabled = false

  const { data, error } = await supabaseAdmin.from('profiles').update(updates).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message },{ status: 500 })
  return NextResponse.json({ data })
}
`);

console.log('File generation complete.');
