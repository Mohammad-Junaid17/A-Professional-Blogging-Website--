import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminEditButton } from "@/components/admin/AdminEditButton";

export function QACard({ qa }: { qa: any }) {
  const answerPreview = qa.admin_answer || qa.answer || "";
  // Strip simple markdown or just truncate
  const previewText = answerPreview.replace(/[#_*\[\]]/g, "").substring(0, 150) + (answerPreview.length > 150 ? "..." : "");

  return (
    <div className="relative h-full group">
      <AdminEditButton id={qa.id} type="qa" />
      <Link href={`/qa/${qa.id}`} className="block h-full">
        <div className="bg-card border border-border p-6 rounded-xl hover:border-primary/50 hover:shadow-md transition-all flex flex-col h-full">
          <div className="flex gap-4 mb-4">
            <div className="flex-shrink-0 pt-1">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-card font-bold">
                Q
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-foreground font-serif group-hover:text-primary transition-colors line-clamp-2">
                {qa.question}
              </h3>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
            {qa.answered_by && (
              <span className="bg-primary-light text-primary font-semibold px-2 py-1 rounded-full">
                {qa.answered_by}
              </span>
            )}
            <span className="text-muted font-medium">
              {qa.category} {qa.sub_category && `• ${qa.sub_category}`}
            </span>
          </div>

          <p className="text-muted text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
            {previewText}
          </p>

          <div className="mt-auto pt-4 border-t border-border/50">
            <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:underline">
              Read Full Answer <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
