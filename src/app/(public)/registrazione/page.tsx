import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Registrati" };

export default async function RegistrationRoute({ searchParams }: { searchParams: Promise<{ callbackURL?: string }> }) {
  const { callbackURL } = await searchParams;
  return <RegisterForm callbackURL={safeRedirectPath(callbackURL, "/onboarding")} />;
}
