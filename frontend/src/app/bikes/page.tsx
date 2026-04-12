import type { Metadata } from "next";
import { Suspense } from "react";
import { BikeCataloguePage } from "./catalogue-client";
import { APP_CONFIG, SEO_DEFAULTS } from "@/config/constants";

export const revalidate = 3600; // ISR cache for 1 hour

export const metadata: Metadata = {
  title: "Bike Catalogue - All Motorcycles",
  description:
    "Browse 300+ motorcycles in Bangladesh. Compare prices, specs, mileage, and find your perfect bike. Filter by brand, category, price, and engine CC.",
  keywords: [
    "motorcycle catalogue",
    "bike prices Bangladesh",
    "compare bikes",
    "Yamaha bikes",
    "Honda motorcycles",
    "KTM bikes",
    "sports bikes",
    "commuter bikes",
  ],
  openGraph: {
    title: `Bike Catalogue - All Motorcycles${SEO_DEFAULTS.titleSuffix}`,
    description:
      "Browse 300+ motorcycles in Bangladesh. Compare prices, specs, and find your perfect bike.",
    url: `${APP_CONFIG.url}/bikes`,
  },
};

// Loading skeleton for catalogue
function CatalogueSkeleton() {
  return (
    <div className="w-full px-4 md:px-8 py-8">
      {/* Header skeleton */}
      <div className="h-10 w-48 bg-muted rounded animate-pulse mb-2" />
      <div className="h-5 w-80 bg-muted rounded animate-pulse mb-8" />

      {/* Filters bar skeleton */}
      <div className="flex justify-between mb-6">
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 w-32 bg-muted rounded animate-pulse" />
          <div className="h-9 w-24 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden border">
            <div className="aspect-[4/3] bg-muted animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              <div className="h-6 w-24 bg-muted rounded animate-pulse" />
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                <div className="h-4 w-12 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BikesPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is the price of Yamaha bike in Bangladesh 2026?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yamaha bike prices in Bangladesh start from ৳1.5 lakh for commuter bikes like the FZS and go up to ৳8+ lakh for the R15 V4. Check MrBikeBD for the latest 2026 prices."
                }
              },
              {
                "@type": "Question",
                "name": "Which is the best bike for daily commute in Dhaka?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For daily commute in Dhaka, 100cc to 125cc commuter bikes like Honda Dream 110, TVS Metro Plus, and Bajaj Discover are highly recommended due to their excellent mileage and low maintenance."
                }
              }
            ]
          })
        }}
      />
      <Suspense fallback={<CatalogueSkeleton />}>
        <BikeCataloguePage />
      </Suspense>
    </main>
  );
}
