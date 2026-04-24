import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Klipora | Transforme Vídeos Longos em Clips Virais com IA",
  description: "Suba seu vídeo, cole um link do Drive ou escaneie o QR com o celular. A IA do Klipora corta, legenda e empacota clips prontos para TikTok, Reels e Shorts.",
  keywords: "clips virais, legendas automáticas, AI clipping, TikTok, Reels, Shorts, edição de vídeo IA",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Klipora | Clips Virais com IA",
    description: "1 vídeo. Dezenas de clips prontos para postar.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}

