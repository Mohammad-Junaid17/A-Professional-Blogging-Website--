import { verifyAdmin } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function QuotesLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdmin(false, 'quotes');
  if (!session) redirect('/admin');
  return <>{children}</>;
}
