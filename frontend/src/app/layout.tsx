import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { Header, Footer, MobileNav } from "@/components/layout";
import { CompareBar } from "@/components/bikes";
import { APP_CONFIG, SEO_DEFAULTS } from "@/config/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_CONFIG.url),
  title: {
    default: `${APP_CONFIG.name} - ${APP_CONFIG.tagline}`,
    template: `%s${SEO_DEFAULTS.titleSuffix}`,
  },
  description: APP_CONFIG.description,
  keywords: [
    "motorcycle",
    "bike",
    "Bangladesh",
    "used bikes",
    "compare bikes",
    "bike price",
    "Yamaha",
    "Honda",
    "Suzuki",
    "KTM",
    "bike reviews",
    "bike news",
  ],
  authors: [{ name: APP_CONFIG.name }],
  creator: APP_CONFIG.name,
  publisher: APP_CONFIG.name,
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: SEO_DEFAULTS.locale,
    url: APP_CONFIG.url,
    siteName: APP_CONFIG.name,
    title: `${APP_CONFIG.name} - ${APP_CONFIG.tagline}`,
    description: APP_CONFIG.description,
    images: [
      {
        url: SEO_DEFAULTS.defaultOgImage,
        width: 1200,
        height: 630,
        alt: APP_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_CONFIG.name} - ${APP_CONFIG.tagline}`,
    description: APP_CONFIG.description,
    images: [SEO_DEFAULTS.defaultOgImage],
    creator: SEO_DEFAULTS.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

// ... existing imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Root layout with global providers
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F97316" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen flex flex-col`}
      >
        <Providers>
          <Header />
          <main className="flex-1 pb-20 lg:pb-0">{children}</main>
          <Footer />
          <MobileNav />
          <CompareBar />
        </Providers>
      </body>
    </html>
  );
}
