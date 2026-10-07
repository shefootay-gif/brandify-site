import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { elMessiri, outfit } from "../fonts";

export const metadata: Metadata = {
  title: { default: "لوحة التحكم | Brandify", template: "%s | لوحة التحكم" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#021D4E", width: "device-width", initialScale: 1 };

// The dashboard is Arabic-first (RTL); every content field is still edited in both languages.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${elMessiri.variable} ${outfit.variable}`}>
      <body className="bg-paper">{children}</body>
    </html>
  );
}
