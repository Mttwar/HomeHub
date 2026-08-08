import { redirect } from "next/navigation";
import { requireMembership } from "@/server/auth/require-membership";

export default async function HomePage() {
  const { membership } = await requireMembership();
  redirect(membership.role === "OWNER" ? "/owner/dashboard" : "/tenant/dashboard");
}
