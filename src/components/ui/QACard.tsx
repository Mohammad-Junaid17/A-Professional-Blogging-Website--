import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminEditButton } from "@/components/admin/AdminEditButton";

export function QACard({ qa }: { qa: any }) {
  const answerPreview = qa.admin_answer || qa.answer || "";
  const previewText = answerPreview.replace(/[#_*\[\]]/g, "").substring(0, 150) + (answerPreview.length > 150 ? "..." : "");

  const CardContent = () => (
    <div className="group block bg-card border border-border p-6 rounded-xl hover:shadow-sm transition-all h-full flex flex-col justify-center relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <span className="bg-background px-3 py-1 rounded-full text-xs font-bold tracking-wider text-muted uppercase">
            Q&A {qa.category && `• ${qa.category}`}
          </span>
          <span className="text-sm text-muted">
            {new Date(qa.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted group-hover:text-primary transition-colors">
          <span>Read Full Answer</span>
          <ArrowRight size={16} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
      
      <h3 className="text-2xl font-serif font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
        {qa.title || qa.question}
      </h3>
      
      <p className="text-muted text-sm line-clamp-2 mb-4 leading-relaxed max-w-4xl">
        {previewText}
      </p>
      
      <div className="text-sm text-muted font-medium">
        {qa.answered_by || "Admin"}
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      <AdminEditButton id={qa.id} type="qa" returnUrl="/qa" />
      {qa.redirect_url ? (
        <a href={qa.redirect_url} target="_blank" rel="noopener noreferrer" className="block w-full">
          <CardContent />
        </a>
      ) : (
        <Link href={`/qa/${qa.id}`} className="block w-full">
          <CardContent />
        </Link>
      )}
    </div>
  );
}
