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
        url: "/anglerfish-logo.png",
        width: 1200,
        height: 300,
        alt: "Logo AnglerFish"
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
  },
  icons: {
    icon: "/favicon.png",
    apple: "/anglerfish-mark.png"
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
