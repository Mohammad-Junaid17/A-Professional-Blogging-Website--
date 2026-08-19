import { getSessionUser, verifyAdmin } from '@/lib/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import ProfileTabs from './ProfileTabs'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const user = await getSessionUser()
  if (!user) {
    redirect('/auth/signin')
  }

  const supabase = await createClient()

  // Fetch user profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch saved items
  const { data: savedItemsData } = await supabase
    .from('saved_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Enrich saved items with content details
  const savedItems = await Promise.all((savedItemsData || []).map(async (item) => {
    let content = null;
    let url = '#';
    let title = 'Unknown Item';
    
    try {
      if (item.content_type === 'article') {
        const { data } = await supabaseAdmin.from('articles').select('title, slug').eq('id', item.content_id).single()
        if (data) { title = data.title; url = `/articles/${data.slug}`; }
      } else if (item.content_type === 'book') {
        const { data } = await supabaseAdmin.from('books').select('title, slug').eq('id', item.content_id).single()
        if (data) { title = data.title; url = `/books/${data.slug}`; }
      } else if (item.content_type === 'lecture') {
        const { data } = await supabaseAdmin.from('lectures').select('title').eq('id', item.content_id).single()
        if (data) { title = data.title; url = `/lectures`; }
      } else if (item.content_type === 'qa') {
        const { data } = await supabaseAdmin.from('qa_entries').select('question').eq('id', item.content_id).single()
        if (data) { title = data.question; url = `/qa/${item.content_id}`; }
      } else if (item.content_type === 'scholar') {
        const { data } = await supabaseAdmin.from('scholars').select('name_english, slug').eq('id', item.content_id).single()
        if (data) { title = data.name_english; url = `/scholars/${data.slug}`; }
      }
    } catch (e) {}

    return { ...item, title, url }
  }))

  // Fetch user's Q&A
  const { data: userQA } = await supabase
    .from('qa_entries')
    .select('*')
    .eq('submitted_by', user.id)
    .in('status', ['pending', 'answered', 'approved'])
    .order('created_at', { ascending: false })

  // Admin/Moderator content
  let addedContent = []
  const isAdminOrMod = profile?.role === 'admin' || profile?.role === 'moderator'
  const isMainAdmin = profile?.role === 'admin'

  if (isAdminOrMod) {
    const contentTypes = [
      { table: 'articles', label: 'Article', idField: 'slug', urlPrefix: '/articles/' },
      { table: 'books', label: 'Book', idField: 'slug', urlPrefix: '/books/' },
      { table: 'lectures', label: 'Lecture', idField: 'id', urlPrefix: '/lectures' },
      { table: 'scholars', label: 'Scholar', idField: 'slug', urlPrefix: '/scholars/' },
      { table: 'contentions', label: 'Contention', idField: 'id', urlPrefix: '/contentions' }
    ]

    for (const type of contentTypes) {
      let query = supabaseAdmin.from(type.table).select(`*, profiles(email, full_name)`).order('created_at', { ascending: false })
      if (!isMainAdmin) {
        query = query.eq('created_by', user.id)
      } else {
        // Only get items that have a created_by (meaning added by an admin/mod recently)
        query = query.not('created_by', 'is', null)
      }
      
      const { data } = await query
      if (data) {
        data.forEach((item: any) => {
          addedContent.push({
            id: item.id,
            type: type.label,
            title: item.title || item.name_english || 'Untitled',
            url: type.idField === 'id' && type.label !== 'Lecture' && type.label !== 'Contention' ? `${type.urlPrefix}${item.id}` : 
                 type.label === 'Lecture' || type.label === 'Contention' ? type.urlPrefix : 
                 `${type.urlPrefix}${item[type.idField]}`,
            created_at: item.created_at,
            created_by_name: item.profiles?.full_name || item.profiles?.email || 'Unknown',
            created_by_id: item.created_by
          })
        })
      }
    }
    
    // Sort by date descending
    addedContent.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">My Profile</h1>
          <p className="text-muted text-sm mt-1">Manage your saved items and track your questions.</p>
        </div>
        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-xl shadow-sm">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
            {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="text-left">
            <p className="font-medium text-foreground leading-tight">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-muted truncate max-w-[150px]">{user.email}</p>
          </div>
        </div>
      </header>

      {/* Instructions Section (User Requested) */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
        <h2 className="font-bold text-primary mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Welcome to your Profile
        </h2>
        <div className="text-sm text-foreground/80 space-y-2">
          <p>Here you can view all the content you have saved across the site, including Articles, Books, Q&A, and Lectures.</p>
          <p>You can also track the status of questions you have submitted. When your questions are approved and answered by our team, they will appear here.</p>
          <p className="text-primary/80 italic text-xs mt-2 border-l-2 border-primary pl-2">Note: Obtaining answers from scholars takes time. Please wait at least 72 hours before expecting an answer.</p>
          {isAdminOrMod && (
            <p className="font-medium text-primary mt-2">As a {profile?.role}, you have access to the "Added Content" tab to track items you have published.</p>
          )}
        </div>
      </div>

      <ProfileTabs 
        savedItems={savedItems} 
        userQA={userQA || []} 
        addedContent={addedContent}
        isAdminOrMod={isAdminOrMod}
        isMainAdmin={isMainAdmin}
      />
    </div>
  )
}
