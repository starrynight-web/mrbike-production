import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SEO_DEFAULTS, APP_CONFIG } from "@/config/constants";
import { NewsDetailClient } from "./news-detail-client";
import { Skeleton } from "@/components/ui/skeleton";
import { apiServer } from "@/lib/api-server";

export const revalidate = 1800; // 30 mins cache

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const article = await apiServer.getArticle(slug);

    if (!article) {
        return {
            title: "Article Not Found",
            description: "The requested news article could not be found."
        };
    }

    const title = article.meta_title || article.title;
    const description = article.meta_description || article.excerpt || article.summary || `Read full article about ${article.title} on MrBikeBD.`;

    return {
        title: `${title}${SEO_DEFAULTS.titleSuffix}`,
        description: description,
        openGraph: {
            title: title,
            description: description,
            url: `${APP_CONFIG.url}/news/${slug}`,
            type: "article",
            images: [
                {
                    url: article.thumbnail_url || article.image || SEO_DEFAULTS.defaultOgImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                }
            ]
        },
    };
}

export async function generateStaticParams() {
    const slugs = await apiServer.getAllArticleSlugs();
    return slugs.length > 0 ? slugs : [];
}

export default async function NewsDetailPage({ params }: Props) {
    const { slug } = await params;
    
    if (!slug) notFound();

    const article = await apiServer.getArticle(slug);
    if (!article) notFound();

    // Structured Data (JSON-LD)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": article.title,
        "image": [
            article.thumbnail_url || article.image || SEO_DEFAULTS.defaultOgImage
        ],
        "datePublished": article.published_at || article.created_at,
        "dateModified": article.updated_at || article.published_at || article.created_at,
        "author": [{
            "@type": "Person",
            "name": article.author?.username || "MrBike Editor",
            "url": `${APP_CONFIG.url}/profile/${article.author?.username}`
        }],
        "publisher": {
            "@type": "Organization",
            "name": "MrBikeBD",
            "logo": {
                "@type": "ImageObject",
                "url": "https://mrbikebd.com/images/logo.png"
            }
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
                "name": "News",
                "item": `${APP_CONFIG.url}/news`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": article.title,
                "item": `${APP_CONFIG.url}/news/${slug}`
            }
        ]
    };

    return (
        <main className="min-h-screen bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <Suspense fallback={<NewsDetailSkeleton />}>
                <NewsDetailClient slug={slug} initialData={article} />
            </Suspense>
        </main>
    );
}

function NewsDetailSkeleton() {
    return (
        <div className="container py-10 max-w-4xl mx-auto">
            <Skeleton className="h-4 w-24 mb-6" />
            <Skeleton className="h-12 w-full mb-6" />
            <div className="flex items-center gap-4 mb-8">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
            <Skeleton className="aspect-video w-full rounded-xl mb-8" />
            <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
            </div>
        </div>
    );
}
