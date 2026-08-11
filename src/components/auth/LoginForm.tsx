"use client";

import { LoginPage } from "@/components/portal/pages/LoginPage";
import { authClient } from "@/lib/auth-client";

export function LoginForm({ callbackURL = "/", googleConfigured = false }: { callbackURL?: string; googleConfigured?: boolean }) {
  const login = async (email: string, password: string) => {
    const result = await authClient.signIn.email({ email, password });
    if (result.error) {
      if (result.error.code === "EMAIL_NOT_VERIFIED") return "Verifica il tuo indirizzo email prima di accedere.";
      if (result.error.code === "INVALID_ORIGIN") return "Origine dell’app non autorizzata. Controlla la configurazione locale.";
      if (result.error.code === "INVALID_EMAIL_OR_PASSWORD") return "Email o password non corretti.";
      return result.error.message ?? "Accesso non riuscito";
    }
    window.location.assign(callbackURL);
  };

  const loginWithGoogle = async () => {
    const result = await authClient.signIn.social({ provider: "google", callbackURL });
    return result.error?.message ?? undefined;
  };

  return <LoginPage googleConfigured={googleConfigured} onLogin={login} onGoogleLogin={googleConfigured ? loginWithGoogle : undefined} />;
}
