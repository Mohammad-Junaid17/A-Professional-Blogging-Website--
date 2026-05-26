import { verifyAdmin } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function ProofsLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdmin(false, 'proofs');
  if (!session) redirect('/admin');
  return <>{children}</>;
}
