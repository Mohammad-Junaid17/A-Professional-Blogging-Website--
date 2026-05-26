import { verifyAdmin } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function BooksLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdmin(false, 'books');
  if (!session) redirect('/admin');
  return <>{children}</>;
}
