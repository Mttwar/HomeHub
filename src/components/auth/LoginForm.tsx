"use client";

import { useRouter } from "next/navigation";
import { LoginPage } from "@/components/portal/pages/LoginPage";
import { authClient } from "@/lib/auth-client";

export function LoginForm({ callbackURL = "/" }: { callbackURL?: string }) {
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const result = await authClient.signIn.email({ email, password });
    if (result.error) {
      if (result.error.status === 403) return "Verifica il tuo indirizzo email prima di accedere.";
      if (result.error.code === "INVALID_EMAIL_OR_PASSWORD") return "Email o password non corretti.";
      return result.error.message ?? "Accesso non riuscito";
    }
    router.replace(callbackURL);
    router.refresh();
  };

  return <LoginPage onLogin={login} />;
}
