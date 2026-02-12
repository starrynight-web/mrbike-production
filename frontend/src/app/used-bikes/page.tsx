import { Suspense } from "react";
import { Metadata } from "next";
import { SEO_DEFAULTS } from "@/config/constants";
import { UsedBikesClient } from "./used-bikes-client";
import { Skeleton } from "@/components/ui/skeleton";

// export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Used Bike Marketplace${SEO_DEFAULTS.titleSuffix}`,
  description:
    "Buy and sell second-hand motorcycles in Bangladesh. Verified listings, direct seller contact, and trusted deals.",
  openGraph: {
    title: `Used Bike Marketplace${SEO_DEFAULTS.titleSuffix}`,
    description:
      "Buy and sell second-hand motorcycles in Bangladesh. Verified listings, direct seller contact, and trusted deals.",
  },
};

export default function UsedBikesPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
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
