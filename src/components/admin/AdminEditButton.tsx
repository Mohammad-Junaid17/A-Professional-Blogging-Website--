import { verifyAdmin } from "@/lib/auth-helpers";
import Link from "next/link";
import { Pencil } from "lucide-react";

interface AdminEditButtonProps {
  id: string;
  type: "books" | "articles" | "scholars" | "lectures" | "contentions" | "qa";
  returnUrl?: string;
}

export async function AdminEditButton({ id, type, returnUrl }: AdminEditButtonProps) {
  const session = await verifyAdmin();
  if (!session) return null;

  const href = returnUrl
    ? `/admin/${type}/${id}/edit?returnUrl=${encodeURIComponent(returnUrl)}`
    : `/admin/${type}/${id}/edit`;

  return (
    <Link 
      href={href} 
      className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm border border-border text-muted hover:text-primary hover:border-primary rounded-md transition-colors z-10 shadow-sm"
      title={`Edit this ${type === 'qa' ? 'Q&A' : type.slice(0, -1)}`}
    >
      <Pencil size={16} />
    </Link>
  );
}
