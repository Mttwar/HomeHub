"use client";

import { useRouter } from "next/navigation";
import { RegisterPage } from "@/components/portal/pages/RegisterPage";
import { authClient } from "@/lib/auth-client";

export function RegisterForm({ callbackURL = "/onboarding" }: { callbackURL?: string }) {
  const router = useRouter();

  const register = async (name: string, email: string, password: string) => {
    const result = await authClient.signUp.email({ name, email, password, callbackURL });
    if (result.error) {
      if (result.error.status === 422) return "Esiste già un account associato a questa email.";
      return result.error.message ?? "Registrazione non riuscita";
    }

    const destination = result.data.token
      ? callbackURL
      : `/verifica-email?email=${encodeURIComponent(email)}&callbackURL=${encodeURIComponent(callbackURL)}`;
    router.replace(destination);
    router.refresh();
  };

  return <RegisterPage onRegister={register} />;
}
