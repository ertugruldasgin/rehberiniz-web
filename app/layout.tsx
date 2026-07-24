import type { Metadata, Viewport } from "next";
import "./globals.css";

import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";

import "@fontsource/merriweather/300.css";
import "@fontsource/merriweather/300-italic.css";
import "@fontsource/merriweather/400.css";
import "@fontsource/merriweather/400-italic.css";
import "@fontsource/merriweather/700.css";
import "@fontsource/merriweather/700-italic.css";
import "@fontsource/merriweather/900.css";
import "@fontsource/merriweather/900-italic.css";

import { TooltipProvider } from "@/components/ui/tooltip";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rehberiniz.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rehberiniz",
    template: "%s | Rehberiniz",
  },
  description:
    "Eğitim kurumları ve rehberlik danışmanları için deneme analizi ve öğrenci gelişim takibi. YKS ve LGS net takibi, gelişim grafikleri, kurum içi raporlama.",
  applicationName: "Rehberiniz",
  keywords: [
    "rehberlik yazılımı",
    "öğrenci takip sistemi",
    "deneme analiz programı",
    "YKS net takibi",
    "LGS takip",
    "rehberlik servisi programı",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    siteName: "Rehberiniz",
    title: "Rehberiniz — Öğrenci takip ve rehberlik platformu",
    description: "Öğrencilerinizin geleceği, verilerle şekilleniyor.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rehberiniz",
    description: "Öğrencilerinizin geleceği, verilerle şekilleniyor.",
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#4F6BED",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="bg-sidebar">
      <body className="font-sans antialiased scrollbar-hide">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
