import { redirect } from "next/navigation";
import { getSession } from "@/server/lib/session";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect("/patients");
  return <LoginForm />;
}
