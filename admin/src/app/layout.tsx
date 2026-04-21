import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--sans",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BuildInSerbia",
  description:
    "Besplatan alat za planiranje gradnje i renoviranja u Srbiji. Procena troškova, koraci, dokumentacija i preporuke za materijale.",
  icons: {
    icon: "/ico.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sr" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${montserrat.variable}`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
