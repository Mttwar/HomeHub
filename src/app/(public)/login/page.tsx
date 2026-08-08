import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Accedi" };

export default function LoginRoute() {
  return <LoginForm />;
}
