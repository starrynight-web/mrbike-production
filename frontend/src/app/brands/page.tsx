import { Suspense } from "react";
import { Metadata } from "next";
import { SEO_DEFAULTS } from "@/config/constants";
import { BrandsClient } from "./brands-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: `All Bike Brands${SEO_DEFAULTS.titleSuffix}`,
  description:
    "Explore motorcycles by brands. Browse all top motorcycle manufacturers in Bangladesh including Yamaha, Honda, Suzuki, and more.",
  openGraph: {
    title: `Motorcycle Brands in Bangladesh${SEO_DEFAULTS.titleSuffix}`,
    description:
      "Explore motorcycles by brands. Browse all top motorcycle manufacturers in Bangladesh.",
  },
};

export default function BrandsPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <Suspense fallback={<BrandsSkeleton />}>
        <BrandsClient />
      </Suspense>
    </main>
  );
}

function BrandsSkeleton() {
  return (
    <div className="container py-12 md:py-20">
      <Skeleton className="h-10 w-64 mb-4" />
      <Skeleton className="h-6 w-96 mb-12" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl border p-6 flex items-center justify-center"
          >
            <Skeleton className="h-16 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
