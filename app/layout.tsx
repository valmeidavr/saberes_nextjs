import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PWARegister } from "@/components/pwa-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3001'),
  title: "Resgatando Saberes",
  description: "Sistema de gestão de conhecimentos tradicionais, agricultura sustentável e receitas saudáveis",
  keywords: "agricultura, receitas saudáveis, conhecimentos tradicionais, sustentabilidade",
  authors: [{ name: "Resgatando Saberes" }],
  creator: "Resgatando Saberes",
  publisher: "Resgatando Saberes",
  robots: "index, follow",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Resgatando Saberes"
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: "website",
    siteName: "Resgatando Saberes",
    title: "Resgatando Saberes",
    description: "Sistema de gestão de conhecimentos tradicionais, agricultura sustentável e receitas saudáveis",
    images: [{
      url: "/icons/icon-512x512.png",
      width: 512,
      height: 512,
      alt: "Resgatando Saberes"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Resgatando Saberes",
    description: "Sistema de gestão de conhecimentos tradicionais, agricultura sustentável e receitas saudáveis",
    images: ["/icons/icon-512x512.png"]
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }
    ],
    shortcut: "/icons/icon-192x192.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="application-name" content="Resgatando Saberes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Resgatando Saberes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#1e293b" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="mask-icon" href="/icons/icon.svg" color="#1e293b" />
        <link rel="shortcut icon" href="/icons/icon-192x192.png" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://saberes.app" />
        <meta name="twitter:title" content="Resgatando Saberes" />
        <meta name="twitter:description" content="Sistema de gestão de conhecimentos tradicionais" />
        <meta name="twitter:image" content="/icons/icon-512x512.png" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Resgatando Saberes" />
        <meta property="og:description" content="Sistema de gestão de conhecimentos tradicionais" />
        <meta property="og:site_name" content="Resgatando Saberes" />
        <meta property="og:url" content="https://saberes.app" />
        <meta property="og:image" content="/icons/icon-512x512.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <Providers>
          {children}
          <PWARegister />
        </Providers>
      </body>
    </html>
  );
}
