import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { getAppUrl } from "@/server/app-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: { default: "CasaHub", template: "%s · CasaHub" },
  description: "Il portale condiviso per gestire appartamento, spese, documenti e manutenzioni.",
  openGraph: {
    title: "CasaHub",
    description: "La casa, in un unico posto.",
    images: ["/og.png"],
    locale: "it_IT",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#111827", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="it" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
