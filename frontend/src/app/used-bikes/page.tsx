import { Suspense } from "react";
import { Metadata } from "next";
import { SEO_DEFAULTS } from "@/config/constants";
import { UsedBikesClient } from "./used-bikes-client";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 300; // 5 min cache

export const metadata: Metadata = {
  title: "Used Bikes For Sale in Bangladesh 2026 — MrBikeBD Marketplace",
  description:
    "Buy and sell second-hand motorcycles in Bangladesh. Browse verified used bike listings from Dhaka, Chittagong, Sylhet and all districts. Safe, trusted used bike marketplace.",
  openGraph: {
    title: "Used Bikes For Sale in Bangladesh 2026 — MrBikeBD Marketplace",
    description:
      "Buy and sell second-hand motorcycles in Bangladesh. Browse verified used bike listings from Dhaka, Chittagong, Sylhet and all districts. Safe, trusted used bike marketplace.",
  },
};

export default function UsedBikesPage() {
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
                "name": "Is it safe to buy a used bike on MrBikeBD?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, MrBikeBD manually reviews listings. However, we always recommend meeting the seller in person, verifying the registration papers (Bluebook), and checking the engine condition before making any payment."
                }
              },
              {
                "@type": "Question",
                "name": "How to check papers of a used bike in Bangladesh?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Always verify the BRTA registration certificate (Bluebook/Smart Card), tax token, and ensure the chassis number and engine number match the physical bike."
                }
              }
            ]
          })
        }}
      />
      <Suspense fallback={<UsedBikesSkeleton />}>
        <UsedBikesClient />
      </Suspense>
    </main>
  );
}

function UsedBikesSkeleton() {
  return (
    <div className="w-full px-4 md:px-8 py-12">
      <Skeleton className="h-10 w-64 mb-4" />
      <Skeleton className="h-6 w-96 mb-8" />
      <div className="flex flex-col lg:flex-row gap-8">
        <Skeleton className="w-full lg:w-64 h-[500px]" />
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-[4/3] h-64 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
