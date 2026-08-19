"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Bookmark, HelpCircle, FileText, Calendar, ExternalLink, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function ProfileTabs({ 
  savedItems, 
  userQA, 
  addedContent,
  isAdminOrMod,
  isMainAdmin
}: { 
  savedItems: any[], 
  userQA: any[], 
  addedContent: any[],
  isAdminOrMod: boolean,
  isMainAdmin: boolean
}) {
  const [activeTab, setActiveTab] = useState<'saved' | 'qa' | 'added'>('saved')
  const router = useRouter()

  const handleUnsave = async (contentType: string, contentId: string) => {
    try {
      const res = await fetch('/api/profile/saved', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type: contentType, content_id: contentId }),
      })
      if (res.ok) {
        toast.success("Removed from saved items")
        router.refresh()
      } else {
        toast.error("Failed to remove item")
      }
    } catch (e) {
      toast.error("An error occurred")
    }
  }

  const handleRemind = async (qaId: string) => {
    try {
      const res = await fetch('/api/profile/remind-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: qaId }),
      })
      if (res.ok) {
        toast.success("Reminder sent to admins")
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to send reminder")
      }
    } catch (e) {
      toast.error("An error occurred")
    }
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-border mb-8 scrollbar-hide">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'saved'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground hover:border-border'
          }`}
        >
          <Bookmark size={18} />
          Saved Items
          <span className="bg-muted/10 text-muted-foreground px-2 py-0.5 rounded-full text-xs ml-1">
            {savedItems.length}
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab('qa')}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'qa'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground hover:border-border'
          }`}
        >
          <HelpCircle size={18} />
          My Questions
          <span className="bg-muted/10 text-muted-foreground px-2 py-0.5 rounded-full text-xs ml-1">
            {userQA.length}
          </span>
        </button>

        {isAdminOrMod && (
          <button
            onClick={() => setActiveTab('added')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'added'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground hover:border-border'
            }`}
          >
            <FileText size={18} />
            {isMainAdmin ? 'All Added Content' : 'My Added Content'}
            <span className="bg-muted/10 text-muted-foreground px-2 py-0.5 rounded-full text-xs ml-1">
              {addedContent.length}
            </span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {/* Saved Items */}
        {activeTab === 'saved' && (
          <div>
            {savedItems.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl">
                <Bookmark size={48} className="mx-auto text-muted/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No saved items yet</h3>
                <p className="text-muted text-sm max-w-sm mx-auto">
                  When you find an interesting article, book, or lecture, click the save button to bookmark it here for later.
                </p>
                <Link href="/articles" className="inline-block mt-6 px-6 py-2 bg-primary text-card rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Explore Articles
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedItems.map((item) => (
                  <div key={item.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col group">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary/10 px-2 py-1 rounded-md">
                        {item.content_type}
                      </span>
                      <button 
                        onClick={() => handleUnsave(item.content_type, item.content_id)}
                        className="text-muted hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Remove from saved"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h3 className="font-bold font-serif text-foreground leading-snug mb-2 line-clamp-2 flex-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Calendar size={12} /> {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <Link 
                        href={item.url} 
                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        View <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Questions */}
        {activeTab === 'qa' && (
          <div>
            {userQA.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl">
                <HelpCircle size={48} className="mx-auto text-muted/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No questions answered yet</h3>
                <p className="text-muted text-sm max-w-sm mx-auto">
                  When you submit a question and our scholars answer it, it will appear here.
                </p>
                <Link href="/qa" className="inline-block mt-6 px-6 py-2 bg-primary text-card rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Ask a Question
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userQA.map((qa) => {
                  let hasReminded = false;
                  if (qa.reminded_at) {
                    const daysSinceReminder = Math.floor((new Date().getTime() - new Date(qa.reminded_at).getTime()) / (1000 * 60 * 60 * 24));
                    hasReminded = daysSinceReminder < 3;
                  }

                  return (
                    <div key={qa.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        {qa.status === 'pending' ? (
                          <span className="text-[10px] font-bold tracking-widest text-yellow-600 bg-yellow-500/10 px-2 py-1 rounded-md uppercase">
                            Pending
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold tracking-widest text-green-600 bg-green-500/10 px-2 py-1 rounded-md uppercase">
                            Answered
                          </span>
                        )}
                        <span className="text-xs text-muted flex items-center gap-1">
                          <Calendar size={12} /> {new Date(qa.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-foreground mb-4 line-clamp-2">
                        {qa.question}
                      </h3>
                      
                      {qa.status === 'pending' ? (
                        <div className="pt-2 border-t border-border/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-muted">Awaiting scholar review</span>
                            <button
                              onClick={() => handleRemind(qa.id)}
                              disabled={hasReminded}
                              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                                hasReminded 
                                  ? 'bg-muted/10 text-muted cursor-not-allowed' 
                                  : 'bg-primary/10 text-primary hover:bg-primary/20'
                              }`}
                            >
                              {hasReminded ? 'Reminded Admin' : 'Remind Admin'}
                            </button>
                          </div>
                          <p className="text-[10px] text-muted italic">
                            * Please allow up to 72 hours for an answer before reminding. Avoid clicking repeatedly.
                          </p>
                        </div>
                      ) : (
                        <Link 
                          href={`/qa/${qa.id}`}
                          className="text-sm font-medium text-primary hover:underline flex items-center gap-1 pt-2 border-t border-border/50"
                        >
                          Read Answer <ExternalLink size={14} />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Added Content (Admin/Mod only) */}
        {activeTab === 'added' && isAdminOrMod && (
          <div>
            {addedContent.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl">
                <FileText size={48} className="mx-auto text-muted/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No content added yet</h3>
                <p className="text-muted text-sm">
                  Content you create in the admin panel will appear here.
                </p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted uppercase bg-muted/5 border-b border-border">
                      <tr>
                        <th className="px-6 py-4 font-bold">Type</th>
                        <th className="px-6 py-4 font-bold">Title</th>
                        {isMainAdmin && <th className="px-6 py-4 font-bold">Added By</th>}
                        <th className="px-6 py-4 font-bold">Date Added</th>
                        <th className="px-6 py-4 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {addedContent.map((item) => (
                        <tr key={`${item.type}-${item.id}`} className="hover:bg-muted/5 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary/10 px-2 py-1 rounded-md">
                              {item.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-foreground max-w-xs truncate">
                            {item.title}
                          </td>
                          {isMainAdmin && (
                            <td className="px-6 py-4 text-muted">
                              {item.created_by_name}
                            </td>
                          )}
                          <td className="px-6 py-4 text-muted whitespace-nowrap">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link 
                              href={item.url} 
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              View <ExternalLink size={14} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
