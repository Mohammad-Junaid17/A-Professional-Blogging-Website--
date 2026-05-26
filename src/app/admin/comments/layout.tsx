import { verifyAdmin } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function CommentsLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdmin(false, 'comments');
  if (!session) redirect('/admin');
  return <>{children}</>;
}
