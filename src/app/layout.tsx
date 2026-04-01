import type { Metadata } from "next";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planer Budowy | Zarządzaj budową domu bez stresu",
  description: "Aplikacja dla inwestorów prywatnych. Kontrola kosztów, harmonogram, checklisty, pliki i umowy w jednym miejscu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
