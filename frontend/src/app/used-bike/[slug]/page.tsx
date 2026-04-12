import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SEO_DEFAULTS, APP_CONFIG } from "@/config/constants";
import { UsedBikeDetailClient } from "./detail-client";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 300; // Revalidate every 5 mins for volatile listings
import { apiServer } from "@/lib/api-server";
import { mapUsedBike } from "@/lib/data-utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bike = await apiServer.getUsedBike(slug);

  if (!bike) {
    return {
      title: "Listing Not Found",
      description: "The requested used bike listing could not be found.",
    };
  }

  const title = bike.meta_title || `${bike.manufacturing_year || bike.year} ${bike.bike_model_name || bike.title}`;
  const description = bike.meta_description || `Buy used ${title} in ${bike.location}. Price: ৳${bike.price}. Check details and contact seller on MrBikeBD.`;

  return {
    title: bike.meta_title ? bike.meta_title : `${title} for Sale in ${bike.location}${SEO_DEFAULTS.titleSuffix}`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `${APP_CONFIG.url}/used-bike/${slug}`,
      type: "website",
      images: [
        {
          url: bike.image_url || (bike.images && bike.images[0]?.url) || SEO_DEFAULTS.defaultOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
    const slugs = await apiServer.getAllUsedBikeSlugs();
    return slugs.length > 0 ? slugs : [];
}

export default async function UsedBikeDetailPage({ params }: Props) {
  const { slug } = await params;
  
  if (!slug) notFound();

  const rawBikeData = await apiServer.getUsedBike(slug);
  if (!rawBikeData) notFound();
  
  const bikeData = mapUsedBike(rawBikeData);

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${bikeData.year} ${bikeData.bikeName}`,
    "image": bikeData.thumbnailUrl || (bikeData.images && bikeData.images[0]),
    "description": bikeData.description,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "BDT",
      "price": bikeData.price,
      "itemCondition": "https://schema.org/UsedCondition",
      "availability": "https://schema.org/InStock"
    },
    "location": {
      "@type": "Place",
      "name": bikeData.location.city
    }
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
        "name": "Used Bikes",
        "item": `${APP_CONFIG.url}/used-bikes`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": bikeData.bikeName,
        "item": `${APP_CONFIG.url}/used-bike/${slug}`
      }
    ]
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Suspense fallback={<UsedBikeDetailSkeleton />}>
        <UsedBikeDetailClient slug={slug} initialData={bikeData} />
      </Suspense>
    </main>
  );
}

function UsedBikeDetailSkeleton() {
  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-8">
          <Skeleton className="aspect-video w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
