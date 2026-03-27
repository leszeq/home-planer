import type { Metadata } from "next";
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
    <html
      lang="pl"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
