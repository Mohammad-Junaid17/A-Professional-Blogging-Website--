import { verifyAdmin } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function ContentionsLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdmin(false, 'contentions');
  if (!session) redirect('/admin');
  return <>{children}</>;
}
