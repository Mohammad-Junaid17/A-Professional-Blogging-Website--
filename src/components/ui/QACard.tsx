import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminEditButton } from "@/components/admin/AdminEditButton";

export function QACard({ qa }: { qa: any }) {
  const answerPreview = qa.admin_answer || qa.answer || "";
  // Strip simple markdown or just truncate
  const previewText = answerPreview.replace(/[#_*\[\]]/g, "").substring(0, 150) + (answerPreview.length > 150 ? "..." : "");

  return (
    <div className="relative h-full group">
      <AdminEditButton id={qa.id} type="qa" returnUrl="/qa" />
      {qa.redirect_url ? (
        <a href={qa.redirect_url} target="_blank" rel="noopener noreferrer" className="block h-full">
          <div className="bg-card border border-border p-5 rounded-xl hover:shadow-md transition-shadow h-full flex flex-col">
            <span className="text-xs font-bold tracking-widest text-primary/80 mb-2 uppercase">
              Q&A {qa.category && `• ${qa.category}`} {qa.sub_category && `• ${qa.sub_category}`}
            </span>
            <h3 className="font-bold text-[1.1rem] text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {qa.question}
            </h3>
            <p className="text-muted text-sm line-clamp-3 mb-4 flex-1">
              {previewText}
            </p>
            <div className="flex items-center justify-between text-xs text-muted font-medium pt-3 border-t border-border/50">
              <span className="text-primary truncate max-w-[60%]">{qa.answered_by || "Admin"}</span>
              <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
                Read Full Answer <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </a>
      ) : (
        <Link href={`/qa/${qa.id}`} className="block h-full">
          <div className="bg-card border border-border p-5 rounded-xl hover:shadow-md transition-shadow h-full flex flex-col">
            <span className="text-xs font-bold tracking-widest text-primary/80 mb-2 uppercase">
              Q&A {qa.category && `• ${qa.category}`} {qa.sub_category && `• ${qa.sub_category}`}
            </span>
            <h3 className="font-bold text-[1.1rem] text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {qa.question}
            </h3>
            <p className="text-muted text-sm line-clamp-3 mb-4 flex-1">
              {previewText}
            </p>
            <div className="flex items-center justify-between text-xs text-muted font-medium pt-3 border-t border-border/50">
              <span className="text-primary truncate max-w-[60%]">{qa.answered_by || "Admin"}</span>
              <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
                Read Full Answer <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}
