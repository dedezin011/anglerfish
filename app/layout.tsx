import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AnglerFish | Campeonatos Digitais de Pesca Esportiva",
  description:
    "Ecossistema digital para pescadores esportivos competirem, registrarem capturas, subirem no ranking e conquistarem recompensas exclusivas.",
  keywords: [
    "pesca esportiva",
    "campeonato de pesca",
    "ranking de pescadores",
    "marketplace de pesca",
    "NFT pesca",
    "AnglerFish"
  ],
  openGraph: {
    title: "AnglerFish | Campeonatos Digitais de Pesca Esportiva",
    description:
      "Compita, registre capturas, suba no ranking e conquiste recompensas exclusivas.",
    url: siteUrl,
    siteName: "AnglerFish",
    images: [
      {
        url: "https://images.unsplash.com/photo-1515960433712-95d3ff8a37ee?auto=format&fit=crop&w=1200&q=82",
        width: 1200,
        height: 630,
        alt: "Pescador esportivo em um barco durante uma pescaria"
      }
    ],
    locale: "pt_BR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "AnglerFish | Campeonatos Digitais de Pesca Esportiva",
    description:
      "O primeiro ecossistema digital para campeonatos de pesca."
  },
  alternates: {
    canonical: siteUrl
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
