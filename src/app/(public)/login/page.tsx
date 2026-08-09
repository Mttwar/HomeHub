import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Accedi" };

export default async function LoginRoute({ searchParams }: { searchParams: Promise<{ callbackURL?: string }> }) {
  const { callbackURL } = await searchParams;
  return <LoginForm callbackURL={safeRedirectPath(callbackURL)} />;
}
