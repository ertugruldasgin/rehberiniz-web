import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Rehberiniz",
  description: "Öğrencilerinizin geleceği, verilerle şekilleniyor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="bg-sidebar">
      <body className="font-sans antialiased">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
