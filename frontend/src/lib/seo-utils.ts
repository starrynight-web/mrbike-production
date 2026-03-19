import { ApiUsedBikeListing, Bike, NewsArticle } from "@/types";

/**
 * Generates Product Schema (JSON-LD) for a Used Bike listing.
 */
export function generateUsedBikeSchema(listing: ApiUsedBikeListing) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": listing.title,
    "image": listing.image_url,
    "description": listing.description || `Buy used ${listing.title} in ${listing.location?.city}. Price: ${listing.price} BDT.`,
    "brand": {
      "@type": "Brand",
      "name": listing.brand || "Unknown"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://mrbikebd.com/used-bike/${listing.slug}`,
      "priceCurrency": "BDT",
      "price": listing.price.toString().replace(/[^0-9]/g, ""),
      "itemCondition": "https://schema.org/UsedCondition",
      "availability": "https://schema.org/InStock"
    },
    "additionalProperty": [
        {
            "@type": "PropertyValue",
            "name": "Mileage",
            "value": `${listing.mileage} km`
        },
        {
            "@type": "PropertyValue",
            "name": "Year",
            "value": listing.manufacturing_year
        }
    ]
  };
}

/**
 * Generates structured BlogPosting schema for news articles.
 */
export function generateNewsSchema(article: NewsArticle) {
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": article.title,
        "image": article.featured_image,
        "author": {
            "@type": "Person",
            "name": article.author?.username || "MrBikeBD Editor"
        },
        "publisher": {
            "@type": "Organization",
            "name": "MrBikeBD",
            "logo": {
                "@type": "ImageObject",
                "url": "https://mrbikebd.com/favicon/favicon-96x96.png"
            }
        },
        "datePublished": article.published_at,
        "description": article.excerpt
    };
}
