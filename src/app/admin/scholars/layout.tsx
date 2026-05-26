import { verifyAdmin } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function ScholarsLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdmin(false, 'scholars');
  if (!session) redirect('/admin');
  return <>{children}</>;
}
