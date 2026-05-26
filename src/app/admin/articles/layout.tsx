import { verifyAdmin } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function ArticlesLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdmin(false, 'articles');
  if (!session) redirect('/admin');
  return <>{children}</>;
}
