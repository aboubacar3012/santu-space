import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Santu Space — Lycée Exemple de Conakry",
  description: "La communauté scolaire pour apprendre, partager et grandir ensemble.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
