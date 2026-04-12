import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { Header, Footer } from "@/components/layout";
import { ScrollToTop } from "@/components/common/scroll-to-top";
import { APP_CONFIG, SEO_DEFAULTS } from "@/config/constants";


const geistSans = Geist({
  variable: "--font-geist-sans",
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
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
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
    <html lang="en-BD" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="/images/hero.webp" fetchPriority="high" /> 
        <link rel="preconnect" href="https://res.cloudinary.com" />
        
        <meta name="geo.region" content="BD" />
        <meta name="geo.placename" content="Bangladesh" />
        <meta name="geo.position" content="23.6850;90.3563" />
        <meta name="ICBM" content="23.6850, 90.3563" />
        <link rel="alternate" hrefLang="en-BD" href="https://mrbikebd.com" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "MrBikeBD",
              "url": "https://mrbikebd.com",
              "logo": "https://mrbikebd.com/images/logo.png",
              "description": "Bangladesh's #1 Motorcycle Information & Marketplace Platform",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "BD",
                "addressLocality": "Dhaka",
                "addressRegion": "Dhaka Division"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": "contact@mrbikebd.com"
              },
              "sameAs": [
                "https://facebook.com/mrbikebd",
                "https://instagram.com/mrbikebd",
                "https://youtube.com/mrbikebd"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "MrBikeBD",
              "url": "https://mrbikebd.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://mrbikebd.com/bikes?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon/favicon-96x96.png"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${geistSans.variable} font-sans min-h-screen flex flex-col`}
      >
        <Providers>
          <ScrollToTop />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
