import { verifyAdmin } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function QaLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdmin(false, 'qa');
  if (!session) redirect('/admin');
  return <>{children}</>;
}
