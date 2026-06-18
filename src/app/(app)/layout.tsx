import { redirect } from "next/navigation";
import { getSession } from "@/server/lib/session";

// Server-side guard (defense in depth alongside middleware).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");
  return <>{children}</>;
}
