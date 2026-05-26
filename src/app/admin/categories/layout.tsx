import { verifyAdmin } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function CategoriesLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdmin(false, 'categories');
  if (!session) redirect('/admin');
  return <>{children}</>;
}
