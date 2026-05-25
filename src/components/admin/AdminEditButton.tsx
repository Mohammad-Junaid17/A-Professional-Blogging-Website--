import { verifyAdmin } from "@/lib/auth-helpers";
import Link from "next/link";
import { Pencil } from "lucide-react";

interface AdminEditButtonProps {
  id: string;
  type: "books" | "articles" | "scholars" | "quotes" | "lectures" | "contentions" | "proofs";
}

export async function AdminEditButton({ id, type }: AdminEditButtonProps) {
  const session = await verifyAdmin();
  if (!session) return null;

  return (
    <Link 
      href={`/admin/${type}/${id}/edit`} 
      className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm border border-border text-muted hover:text-primary hover:border-primary rounded-md transition-colors z-10 shadow-sm"
      title={`Edit this ${type.slice(0, -1)}`}
    >
      <Pencil size={16} />
    </Link>
  );
}
