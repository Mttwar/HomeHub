"use client";

import { useRouter } from "next/navigation";
import { LoginPage } from "@/components/portal/pages/LoginPage";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const result = await authClient.signIn.email({ email, password });
    if (result.error) return result.error.message ?? "Accesso non riuscito";
    router.replace("/");
    router.refresh();
  };

  return <LoginPage onLogin={login} />;
}
