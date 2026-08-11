"use client";

import { RegisterPage } from "@/components/portal/pages/RegisterPage";
import { authClient } from "@/lib/auth-client";
import { authFlowUrl } from "@/lib/auth-flow-url";

export function RegisterForm({ callbackURL = "/onboarding" }: { callbackURL?: string }) {
  const register = async (name: string, email: string, password: string) => {
    const result = await authClient.signUp.email({ name, email, password, callbackURL });
    if (result.error) {
      if (result.error.status === 422) return "Esiste già un account associato a questa email.";
      return result.error.message ?? "Registrazione non riuscita";
    }

    // Reload from the server so the invitation page sees the session cookie
    // created by Better Auth, including on mobile Safari.
    window.location.assign(callbackURL);
  };

  return <RegisterPage onRegister={register} loginHref={authFlowUrl("/login", callbackURL)} />;
}
