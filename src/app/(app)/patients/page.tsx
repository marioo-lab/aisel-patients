import { redirect } from "next/navigation";
import { getSession } from "@/server/lib/session";
import { PatientsClient } from "@/components/patients/patients-client";

export default async function PatientsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  return (
    <PatientsClient user={{ email: user.email, name: user.name, role: user.role }} />
  );
}
