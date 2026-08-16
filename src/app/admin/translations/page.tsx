import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TranslationModal } from "@/components/admin/TranslationModal";
import { TranslationDeleteButton } from "@/components/admin/TranslationDeleteButton";

export const revalidate = 0; // Don't cache this page so requests are always fresh

export default async function TranslationsPage() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) redirect("/auth/signin");

  // Fetch both existing translations and requests
  const [{ data: requests }, { data: translations }] = await Promise.all([
    supabase.from("translation_requests").select("*"),
    supabase.from("translations").select("*").order("created_at", { ascending: false })
  ]);
    
  // Fetch titles for content
  const [{ data: articles }, { data: qas }] = await Promise.all([
    supabase.from("articles").select("id, title"),
    supabase.from("qa_entries").select("id, question")
  ]);

  const contentMap: Record<string, string> = {};
  articles?.forEach(a => { contentMap[a.id] = a.title; });
  qas?.forEach(q => { contentMap[q.id] = q.question; });

  // Group requests
  const groupedRequests: Record<string, any> = {};
  requests?.forEach(req => {
    const key = `${req.content_type}-${req.content_id}-${req.language}`;
    if (!groupedRequests[key]) {
      groupedRequests[key] = {
        id: key,
        content_type: req.content_type,
        content_id: req.content_id,
        language: req.language,
        count: 0,
        title: contentMap[req.content_id] || "Unknown Content",
      };
    }
    groupedRequests[key].count++;
  });

  const sortedRequests = Object.values(groupedRequests).sort((a, b) => b.count - a.count);

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 py-8">
      <div className="flex justify-between items-center bg-card p-6 rounded-lg border border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Translations</h1>
          <p className="text-muted mt-2">Manage existing translations and prioritize user requests.</p>
        </div>
      </div>
      
      {/* Existing Translations Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-foreground">Existing Translations</h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-sm text-muted">
                <th className="px-6 py-4 font-medium">Content Type</th>
                <th className="px-6 py-4 font-medium">Title/Question</th>
                <th className="px-6 py-4 font-medium">Language</th>
                <th className="px-6 py-4 font-medium">Format</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(!translations || translations.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted">
                    No translations added yet.
                  </td>
                </tr>
              )}
              {translations?.map((t: any) => (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 capitalize">{t.content_type}</td>
                  <td className="px-6 py-4 font-medium max-w-xs truncate" title={contentMap[t.content_id]}>
                    {contentMap[t.content_id] || "Unknown Content"}
                  </td>
                  <td className="px-6 py-4 capitalize">{t.language.replace("_", " ")}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-muted/50 px-2 py-1 rounded text-muted-foreground border border-border">
                      {t.external_link ? "External Link" : "Text"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <TranslationModal 
                        contentType={t.content_type} 
                        contentId={t.content_id} 
                        language={t.language} 
                        contentTitle={contentMap[t.content_id] || "Unknown Content"}
                        initialData={t}
                      />
                      <TranslationDeleteButton id={t.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Translation Requests Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-foreground">Pending Requests</h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-sm text-muted">
                <th className="px-6 py-4 font-medium">Content Type</th>
                <th className="px-6 py-4 font-medium">Title/Question</th>
                <th className="px-6 py-4 font-medium">Language</th>
                <th className="px-6 py-4 font-medium">Requests</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted">
                    No pending translation requests.
                  </td>
                </tr>
              )}
              {sortedRequests.map((req: any) => (
                <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 capitalize">{req.content_type}</td>
                  <td className="px-6 py-4 font-medium max-w-xs truncate" title={req.title}>{req.title}</td>
                  <td className="px-6 py-4 capitalize">{req.language.replace("_", " ")}</td>
                  <td className="px-6 py-4">
                    <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-bold">
                      {req.count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <TranslationModal 
                      contentType={req.content_type} 
                      contentId={req.content_id} 
                      language={req.language} 
                      contentTitle={req.title}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
