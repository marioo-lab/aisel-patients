import { redirect } from "next/navigation";

// Middleware normally handles "/", this is a defensive fallback.
export default function RootPage() {
  redirect("/patients");
}
