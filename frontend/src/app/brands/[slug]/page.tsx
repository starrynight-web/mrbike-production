import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SEO_DEFAULTS, APP_CONFIG, ALLOWED_BRANDS } from "@/config/constants";
import { BrandDetailClient } from "./brand-detail-client";
import { Skeleton } from "@/components/ui/skeleton";
import { apiServer } from "@/lib/api-server";
import { JsonLd } from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

const BRAND_ENTITIES: Record<string, { wikipedia: string; wikidata: string }> = {
  yamaha: {
    wikipedia: "https://en.wikipedia.org/wiki/Yamaha_Motor_Company",
    wikidata: "https://www.wikidata.org/wiki/Q158888"
  },
  honda: {
    wikipedia: "https://en.wikipedia.org/wiki/Honda",
    wikidata: "https://www.wikidata.org/wiki/Q9584"
  },
  suzuki: {
    wikipedia: "https://en.wikipedia.org/wiki/Suzuki",
    wikidata: "https://www.wikidata.org/wiki/Q181640"
  },
  ktm: {
    wikipedia: "https://en.wikipedia.org/wiki/KTM",
    wikidata: "https://www.wikidata.org/wiki/Q129112"
  },
  bajaj: {
    wikipedia: "https://en.wikipedia.org/wiki/Bajaj_Auto",
    wikidata: "https://www.wikidata.org/wiki/Q804116"
  },
  tvs: {
    wikipedia: "https://en.wikipedia.org/wiki/TVS_Motor_Company",
    wikidata: "https://www.wikidata.org/wiki/Q2592147"
  },
  hero: {
    wikipedia: "https://en.wikipedia.org/wiki/Hero_MotoCorp",
    wikidata: "https://www.wikidata.org/wiki/Q1613768"
  },
  lifan: {
    wikipedia: "https://en.wikipedia.org/wiki/Lifan_Group",
    wikidata: "https://www.wikidata.org/wiki/Q1115509"
  },
  aprilia: {
    wikipedia: "https://en.wikipedia.org/wiki/Aprilia",
    wikidata: "https://www.wikidata.org/wiki/Q622378"
  },
  royal_enfield: {
    wikipedia: "https://en.wikipedia.org/wiki/Royal_Enfield",
    wikidata: "https://www.wikidata.org/wiki/Q1102148"
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = ALLOWED_BRANDS.find(b => b.slug === slug);
  const title = brand ? brand.name : slug
    .split(/[-_ ]+/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

  return {
    title: `${title} Bikes Price in Bangladesh 2024${SEO_DEFAULTS.titleSuffix}`,
    description: `Browse latest ${title} motorcycle models, official prices, detailed specifications, and user reviews in Bangladesh. Find your dream ${title} bike at MrBikeBD.`,
    alternates: {
      canonical: `${APP_CONFIG.url}/brands/${slug}`,
    },
    openGraph: {
      title: `${title} Bikes in Bangladesh - Price & Specs`,
      description: `Check out the latest ${title} motorcycle prices, specs, and reviews in Bangladesh.`,
      images: brand ? [{ url: brand.logo }] : undefined,
    },
  };
}

export default async function BrandDetailPage({ params }: Props) {
  const { slug } = await params;
  
  // Find brand in static list
  const brandStatic = ALLOWED_BRANDS.find(b => b.slug === slug);
  const brandName = brandStatic ? brandStatic.name : slug;
  
  const brandData = await apiServer.getBrand(slug);
  
  // SEO Structured Data
  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": brandName,
    "logo": brandStatic ? `${APP_CONFIG.url}${brandStatic.logo}` : undefined,
    "url": `${APP_CONFIG.url}/brands/${slug}`,
    "sameAs": BRAND_ENTITIES[slug] ? [
        BRAND_ENTITIES[slug].wikipedia,
        BRAND_ENTITIES[slug].wikidata
    ] : []
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": APP_CONFIG.url
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Brands",
        "item": `${APP_CONFIG.url}/bikes`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": brandName,
        "item": `${APP_CONFIG.url}/brands/${slug}`
      }
    ]
  };

  return (
    <main className="min-h-screen bg-background pb-20">
      <JsonLd data={brandSchema} />
      <JsonLd data={breadcrumbLd} />
      <Suspense fallback={<BrandDetailSkeleton />}>
        <BrandDetailClient slug={slug} initialData={brandData} />
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
