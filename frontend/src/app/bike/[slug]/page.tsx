import type { Metadata } from "next";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { APP_CONFIG, SEO_DEFAULTS } from "@/config/constants";
import { apiServer } from "@/lib/api-server";
import { Skeleton } from "@/components/ui/skeleton";

// 4.5 — Code Splitting: 70KB detail-client is lazy-loaded, not in the critical path bundle
const BikeDetailClient = dynamic(() => import("./detail-client").then((m) => m.BikeDetailClient), {
  loading: () => (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-96 w-full rounded-xl" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  ),
});

export const revalidate = 3600; // ISR cache for 1 hour

interface BikePageProps {
    params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BikePageProps): Promise<Metadata> {
    const { slug } = await params;
    const bike = await apiServer.getBike(slug);

    if (!bike) {
        return {
            title: "Bike Not Found",
            description: "The requested bike could not be found."
        };
    }

    const bikeName = bike.name;
    const brandName = bike.brand?.name || bike.brand_name || "";
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonthStr = currentDate.toLocaleString('default', { month: 'long' });
    const formattedPrice = bike.price ? bike.price.toLocaleString('en-IN') : 'N/A';

    const title = bike.meta_title || `${currentYear} ${brandName} ${bikeName} Price in Bangladesh — MrBikeBD`;
    const description = bike.meta_description || `${brandName} ${bikeName} price in Bangladesh is ৳${formattedPrice}. Check specs, reviews, EMI, and compare with similar bikes. Updated ${currentMonthStr} ${currentYear}.`;

    return {
        title: title,
        description: description,
        keywords: [
            `${brandName} ${bikeName} price in bd`,
            `${bikeName} price bangladesh`,
            `${bikeName} specs`,
            `${brandName} ${bikeName} review`,
            "motorcycle price Bangladesh",
        ],
        openGraph: {
            title: title,
            description: description,
            url: `${APP_CONFIG.url}/bike/${slug}`,
            type: "article",
            publishedTime: bike.created_at || new Date().toISOString(),
            modifiedTime: bike.updated_at || new Date().toISOString(),
            images: [
                {
                    url: bike.primary_image || bike.thumbnailUrl || SEO_DEFAULTS.defaultOgImage,
                    width: 1200,
                    height: 630,
                    alt: bikeName,
                },
            ],
        },
        alternates: {
            canonical: `${APP_CONFIG.url}/bike/${slug}`,
        },
    };
}

// Generate static params for popular bikes (ISR)
export async function generateStaticParams() {
    const slugs = await apiServer.getAllBikeSlugs();
    return slugs.length > 0 ? slugs : [
        { slug: "yamaha-r15-v4" },
        { slug: "honda-cb150r" },
    ];
}

export default async function BikePage({ params }: BikePageProps) {
    const { slug } = await params;

    // Validate slug format
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
        notFound();
    }

    const bikeData = await apiServer.getBike(slug);
    
    if (!bikeData) {
        notFound();
    }

    // Structured Data (JSON-LD)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": bikeData.name,
        "image": bikeData.primary_image || bikeData.thumbnailUrl,
        "description": bikeData.description,
        "brand": {
            "@type": "Brand",
            "name": bikeData.brand?.name || bikeData.brand_name
        },
        "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "BDT",
            "lowPrice": bikeData.price || 0,
            "highPrice": bikeData.price || 0,
            "offerCount": "1",
            "availability": "https://schema.org/InStock"
        },
        "aggregateRating": bikeData.rating?.average ? {
            "@type": "AggregateRating",
            "ratingValue": bikeData.rating.average,
            "reviewCount": bikeData.rating.count || 1
        } : undefined
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
                "name": "Bikes",
                "item": `${APP_CONFIG.url}/bikes`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": bikeData.name,
                "item": `${APP_CONFIG.url}/bike/${slug}`
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <BikeDetailClient slug={slug} initialData={bikeData} />
        </>
    );
}
