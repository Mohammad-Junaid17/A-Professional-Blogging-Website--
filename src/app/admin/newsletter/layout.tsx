import { verifyAdmin } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function NewsletterLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdmin(false, 'newsletter');
  if (!session) redirect('/admin');
  return <>{children}</>;
}
