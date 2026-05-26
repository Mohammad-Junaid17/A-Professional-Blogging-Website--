import { verifyAdmin } from "@/lib/auth-helpers";
import Link from "next/link";
import { Plus } from "lucide-react";

export async function AdminAddButton({ type, label }: { type: string; label: string }) {
  const session = await verifyAdmin();
  if (!session) return null;

  return (
    <Link
      href={`/admin/${type}/create`}
      className="ml-auto flex items-center gap-2 bg-primary text-card px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
    >
      <Plus size={16} />
      {label}
    </Link>
  );
}
