import { supabaseAdmin } from './supabase-admin'
import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

export const verifyAdmin = cache(async (requireSuperAdmin: boolean = false) => {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return null
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !profile || profile.disabled) {
      return null
    }

    if (requireSuperAdmin && profile.role !== 'admin') {
      return null
    }

    if (profile.role !== 'admin' && profile.role !== 'moderator') {
      return null
    }

    // We still return session to maintain type signature, or at least a fake session object if needed.
    // Wait, the original returned `session`. Let's fetch session to return it.
    const { data: { session } } = await supabase.auth.getSession()
    return session || { user }
  } catch (err) {
    console.error('verifyAdmin error:', err)
    return null
  }
})

export async function getSessionUser() {
  try {
    const supabase = await createClient()

    const {
      data: { user }
    } = await supabase.auth.getUser()
    return user ?? null
  } catch {
    return null
  }
}
