"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Send, Loader2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import dynamic from "next/dynamic";
import { MarkdownRenderer } from "./MarkdownRenderer";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface Comment {
  id: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  admin_reply?: string | null;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null; email: string };
}

export default function CommentSection({
  contentType,
  contentId,
}: {
  contentType: string;
  contentId: string;
}) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUserId(session.user.id);

      // Fetch approved comments + user's own pending
      const { data } = await supabase
        .from("comments")
        .select("id, body, status, created_at, user_id, profiles(full_name, email)")
        .eq("content_type", contentType)
        .eq("content_id", contentId)
        .order("created_at", { ascending: false });

      if (data) setComments(data as unknown as Comment[]);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType, contentId]);

  const handleSubmit = async () => {
    if (!body.trim() || !userId) return;
    setSubmitting(true);
    setSuccessMsg(null);

    const { data, error } = await supabase
      .from("comments")
      .insert({ user_id: userId, content_type: contentType, content_id: contentId, body: body.trim() })
      .select("id, body, status, created_at, user_id")
      .single();

    if (!error && data) {
      const { data: { user } } = await supabase.auth.getUser();
      const newComment: Comment = {
        ...data,
        profiles: { full_name: user?.user_metadata?.full_name || null, email: user?.email || "" },
      };
      setComments((prev) => [newComment, ...prev]);
      setBody("");
      setSuccessMsg("Comment submitted! It will appear after moderation.");
    }
    setSubmitting(false);
  };

  const getInitials = (name: string | null, email: string) => {
    if (name && name.trim()) return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    return email?.[0]?.toUpperCase() || "?";
  };

  const approvedComments = comments.filter(c => c.status === "approved" || (c.user_id === userId && c.status === "pending"));

  return (
    <div className="mt-16 border-t border-border pt-8">
      <h2 className="text-xl font-bold font-serif text-foreground flex items-center gap-2 mb-6">
        <MessageSquare size={22} className="text-primary" />
        Comments ({comments.filter(c => c.status === "approved").length})
      </h2>

      {/* Comment List */}
      {loading ? (
        <div className="text-center py-8 text-muted"><Loader2 size={24} className="animate-spin mx-auto" /></div>
      ) : approvedComments.length > 0 ? (
        <div className="space-y-4 mb-8">
          {approvedComments.map((comment) => (
            <div key={comment.id} className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {getInitials(comment.profiles?.full_name || null, comment.profiles?.email || "")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">
                      {comment.profiles?.full_name || comment.profiles?.email || "Anonymous"}
                    </span>
                    <span className="text-xs text-muted">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                    {comment.status === "pending" && (
                      <span className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock size={10} /> Awaiting moderation
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-muted">
                    <MarkdownRenderer content={comment.body} />
                  </div>
                  
                  {comment.admin_reply && (
                    <div className="mt-4 bg-primary/5 border border-primary/10 rounded-md p-3 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary/40 before:rounded-l-md">
                      <div className="flex items-center gap-1.5 mb-2 text-primary">
                        <span className="text-xs font-bold uppercase tracking-wider">Moderator Reply</span>
                      </div>
                      <div className="text-sm text-foreground/90">
                        <MarkdownRenderer content={comment.admin_reply} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted text-sm mb-8">No comments yet. Be the first to share your thoughts!</p>
      )}

      {successMsg && (
        <div className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 p-3 rounded-lg text-sm mb-4">
          {successMsg}
        </div>
      )}

      {/* Comment Input */}
      {userId ? (
        <div className="bg-background border border-border rounded-lg p-4">
          <div data-color-mode="light">
            <MDEditor
              value={body}
              onChange={(val) => setBody(val || "")}
              preview="edit"
              height={150}
            />
          </div>
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || !body.trim()}
              className="flex items-center gap-2 bg-primary text-card px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Submit
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-lg p-6 text-center">
          <p className="text-muted text-sm">
            <a href="/auth/signin" className="text-primary font-semibold hover:underline">Sign in</a> to leave a comment.
          </p>
        </div>
      )}
    </div>
  );
}
