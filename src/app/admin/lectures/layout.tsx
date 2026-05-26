import { verifyAdmin } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function LecturesLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdmin(false, 'lectures');
  if (!session) redirect('/admin');
  return <>{children}</>;
}
