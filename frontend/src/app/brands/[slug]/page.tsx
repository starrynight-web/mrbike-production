import { Suspense } from "react";
import { Metadata } from "next";
import { SEO_DEFAULTS } from "@/config/constants";
import { BrandDetailClient } from "./brand-detail-client";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 3600; // 1 hour cache

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = slug
    .split(/[-_ ]+/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("-");

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  const pageTitle = `${title} Bike Price in Bangladesh ${currentYear} — Latest Models`;
  const pageDescription = `Check all ${title} motorcycle prices in Bangladesh. Find latest ${title} models, specs, mileage, showroom addresses, and user reviews on MrBikeBD.`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      `${title} bike price in bd`,
      `${title} motorcycle price bangladesh`,
      `${title} upcoming bikes`,
      `${title} showrooms in bangladesh`,
    ],
    openGraph: {
      title: pageTitle,
      description: pageDescription,
    },
  };
}

export default async function BrandDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-background pb-20">
      <Suspense fallback={<BrandDetailSkeleton />}>
        <BrandDetailClient slug={slug} />
      </Suspense>
    </main>
  );
}

function BrandDetailSkeleton() {
  return (
    <div className="container py-12 md:py-20">
      <div className="flex flex-col items-center justify-center space-y-4 mb-12">
        <Skeleton className="h-24 w-40 rounded-lg" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video rounded-xl" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
