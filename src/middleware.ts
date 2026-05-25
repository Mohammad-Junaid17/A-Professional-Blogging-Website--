import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAdminPath = path.startsWith('/admin')
  const isAuthPath = path.startsWith('/auth')

  // Helper to correctly redirect while preserving the session cookies we might have just refreshed
  const redirectWithCookies = (url: URL) => {
    const response = NextResponse.redirect(url)
    // Copy cookies from supabaseResponse
    supabaseResponse.cookies.getAll().forEach(cookie => {
      response.cookies.set(cookie.name, cookie.value, cookie)
    })
    return response
  }

  if (isAuthPath && user) {
    return redirectWithCookies(new URL('/', request.url))
  }

  if (isAdminPath) {
    if (!user || userError) {
      const redirectUrl = new URL('/auth/signin', request.url)
      redirectUrl.searchParams.set('redirectTo', path)
      return redirectWithCookies(redirectUrl)
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
      return redirectWithCookies(new URL('/?error=unauthorized', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/:path*',
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ]
}
