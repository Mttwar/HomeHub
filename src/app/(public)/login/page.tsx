import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Accedi" };

export default async function LoginRoute({ searchParams }: { searchParams: Promise<{ callbackURL?: string }> }) {
  const { callbackURL } = await searchParams;
  const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
  return <LoginForm callbackURL={safeRedirectPath(callbackURL)} googleConfigured={googleConfigured} />;
}
