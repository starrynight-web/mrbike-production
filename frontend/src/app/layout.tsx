import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { Header, Footer, MobileNav } from "@/components/layout";
import { ScrollToTop } from "@/components/common/scroll-to-top";
import { CompareBar } from "@/components/bikes";
import { APP_CONFIG, SEO_DEFAULTS } from "@/config/constants";
import { JsonLd } from "@/components/seo/JsonLd";

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

const inter = Inter({
  variable: "--font-inter",
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
  alternates: {
    canonical: APP_CONFIG.url,
    languages: {
      "en-US": "/en",
      "bn-BD": "/bn",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": APP_CONFIG.name,
    "url": APP_CONFIG.url,
    "logo": `${APP_CONFIG.url}/favicon/favicon-96x96.png`,
    "sameAs": [
      APP_CONFIG.socialLinks.facebook,
      APP_CONFIG.socialLinks.instagram,
      APP_CONFIG.socialLinks.youtube,
      APP_CONFIG.socialLinks.twitter
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": APP_CONFIG.phone,
      "contactType": "customer service",
      "email": APP_CONFIG.email,
      "areaServed": "BD",
      "availableLanguage": ["Bengali", "English"]
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": APP_CONFIG.name,
    "url": APP_CONFIG.url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${APP_CONFIG.url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en-US" suppressHydrationWarning>
      <head>
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <link rel="alternate" hrefLang="en-US" href={`${APP_CONFIG.url}/en`} />
        <link rel="alternate" hrefLang="bn-BD" href={`${APP_CONFIG.url}/bn`} />
        <link rel="alternate" hrefLang="x-default" href={APP_CONFIG.url} />
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
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} font-sans min-h-screen flex flex-col`}
      >
        <Providers>
          <ScrollToTop />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CompareBar />
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
