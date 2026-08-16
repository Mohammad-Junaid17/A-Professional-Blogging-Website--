"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface TranslationModalProps {
  contentType: string;
  contentId: string;
  language: string;
  contentTitle: string;
  initialData?: any; // If provided, we are editing
}

export function TranslationModal({
  contentType,
  contentId,
  language,
  contentTitle,
  initialData
}: TranslationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"text" | "link">(initialData?.external_link ? "link" : "text");
  const [content, setContent] = useState(initialData?.content || "");
  const [link, setLink] = useState(initialData?.external_link || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    
    const payload = {
      content_type: contentType,
      content_id: contentId,
      language: language,
      content: type === "text" ? content : null,
      external_link: type === "link" ? link : null,
    };
    
    let error;
    if (initialData?.id) {
       // Update existing
       const res = await supabase.from("translations").update(payload).eq("id", initialData.id);
       error = res.error;
    } else {
       // Insert new
       const res = await supabase.from("translations").insert(payload);
       error = res.error;
    }

    if (!error) {
       // Delete requests since it's fulfilled
       await supabase.from("translation_requests")
         .delete()
         .eq("content_type", contentType)
         .eq("content_id", contentId)
         .eq("language", language);
       
       setIsOpen(false);
       router.refresh();
    } else {
       alert("Error adding translation: " + error.message);
    }
    setLoading(false);
  };

  if (!contentId) return null; // Avoid rendering for empty placeholders

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded text-sm hover:bg-primary/20 transition-colors font-medium"
      >
        {initialData ? "Edit" : <><Plus size={16} /> Add</>}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-bold font-serif text-foreground">{initialData ? "Edit Translation" : "Add Translation"}</h2>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg border border-border">
                <div>
                  <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Content Title</p>
                  <p className="font-medium text-foreground truncate" title={contentTitle}>{contentTitle}</p>
                </div>
                <div>
                  <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Language</p>
                  <p className="font-medium capitalize text-foreground">{language.replace("_", " ")}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-foreground">Translation Format</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${type === "text" ? "border-primary" : "border-muted group-hover:border-foreground"}`}>
                      {type === "text" && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <input type="radio" className="hidden" checked={type === "text"} onChange={() => setType("text")} />
                    <span className={type === "text" ? "text-foreground font-medium" : "text-muted"}>Text Upload</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${type === "link" ? "border-primary" : "border-muted group-hover:border-foreground"}`}>
                      {type === "link" && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <input type="radio" className="hidden" checked={type === "link"} onChange={() => setType("link")} />
                    <span className={type === "link" ? "text-foreground font-medium" : "text-muted"}>External Link</span>
                  </label>
                </div>
              </div>

              {type === "text" ? (
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Translated Content (Markdown supported)</label>
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={12}
                    className="w-full bg-background border border-border rounded p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-none"
                    placeholder="Enter the translated text here..."
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">External URL</label>
                  <input 
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    required
                    className="w-full bg-background border border-border rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    placeholder="https://example.com/translation"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3 border-t border-border mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded text-muted font-medium hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
                >
                  {loading ? "Saving..." : "Save Translation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
