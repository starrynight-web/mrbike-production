import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BikeDetailClient } from "./detail-client";
import { APP_CONFIG, SEO_DEFAULTS } from "@/config/constants";
import { apiServer } from "@/lib/api-server";
import { JsonLd } from "@/components/seo/JsonLd";

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
    const description = bike.meta_description || bike.description || `${bikeName} price in Bangladesh. Check specifications, mileage, images, and reviews.`;
    const title = bike.meta_title || `${brandName} ${bikeName} - Price, Specs, Mileage & Review`;

    return {
        title: title,
        description: description,
        keywords: [
            bikeName,
            brandName,
            `${bikeName} price`,
            `${bikeName} specs`,
            "motorcycle Bangladesh",
        ],
        openGraph: {
            title: `${brandName} ${bikeName}${SEO_DEFAULTS.titleSuffix}`,
            description: description,
            url: `${APP_CONFIG.url}/bike/${slug}`,
            type: "website",
            images: [
                {
                    url: bike.primary_image || bike.thumbnailUrl || SEO_DEFAULTS.defaultOgImage,
                    width: 1200,
                    height: 630,
                    alt: `${brandName} ${bikeName}`,
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

    const reviews = await apiServer.getBikeReviews(bikeData.id);

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
        } : undefined,
        "review": Array.isArray(reviews) ? reviews.map((r: any) => ({
            "@type": "Review",
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": r.rating
            },
            "author": {
                "@type": "Person",
                "name": r.userName || r.user_name || "Anonymous"
            },
            "reviewBody": r.comment,
            "datePublished": r.created_at || r.createdAt
        })) : []
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
            <JsonLd data={jsonLd} />
            <JsonLd data={breadcrumbLd} />
            <BikeDetailClient slug={slug} initialData={bikeData} />
        </>
    );
}
