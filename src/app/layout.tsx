import type { Metadata, Viewport } from "next";
import Script from "next/script";
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5EFE4" },
    { media: "(prefers-color-scheme: dark)", color: "#1E1B16" },
  ],
  colorScheme: "light dark",
};

const themeScript = `
  try {
    const savedTheme = localStorage.getItem("casahub-theme");
    const theme = savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="it" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Script id="casahub-theme" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
