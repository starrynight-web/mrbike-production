import { useState, useEffect } from "react";
import { NewsArticle } from "@/types";

// Mock Data
const MOCK_NEWS: NewsArticle[] = [
    {
        id: "1",
        slug: "yamaha-r15-v5-launch-date",
        title: "Yamaha R15 V5 Launch Date in Bangladesh Confirmed?",
        excerpt: "Rumors suggest Yamaha is planning to bring the next generation R15 V5 with TCS and quick shifter as standard.",
        content: `
            <p>The Yamaha R15 series has been the heartthrob of Bangladeshi bikers for over a decade. With the V4 ruling the streets, anticipation for the V5 is at an all-time high.</p>
            <h3>What's New in V5?</h3>
            <p>Sources suggest the new V5 will feature an updated TFT console with turn-by-turn navigation, improved aerodynamics, and possibly a new color scheme inspired by the R1M.</p>
            <h3>Expected Price</h3>
            <p>Given the current market trends, the R15 V5 is expected to be priced around 6,00,000 BDT.</p>
        `,
        featuredImage: "/bikes/yamaha-r15.webp", // Reusing existing bike image for demo
        author: {
            id: "a1",
            name: "MrBike Team",
            image: "https://github.com/shadcn.png"
        },
        category: "launch",
        tags: ["yamaha", "r15", "launch", "rumor"],
        views: 12500,
        publishedAt: new Date("2026-01-20"),
        updatedAt: new Date("2026-01-20")
    },
    {
        id: "2",
        slug: "honda-cbr-150r-review-2026",
        title: "Honda CBR 150R 2026 Review: Still the King of Comfort?",
        excerpt: "We took the new 2026 CBR 150R for a 500km ride to see if it still holds the crown for the best sports tourer.",
        content: "Full review content goes here...",
        featuredImage: "/bikes/honda-cb150r.webp",
        author: {
            id: "a2",
            name: "Pro Biker",
            image: "https://github.com/shadcn.png"
        },
        category: "review",
        tags: ["honda", "cbr", "review"],
        views: 8900,
        publishedAt: new Date("2026-01-25"),
        updatedAt: new Date("2026-01-25")
    },
    {
        id: "3",
        slug: "electric-bikes-popularity-bangladesh",
        title: "Why Electric Bikes are Failing to Gain Momentum in Bangladesh",
        excerpt: "Despite high fuel prices, EV adoption in the motorcycle segment remains low. We analyze the reasons.",
        content: "Analysis content...",
        featuredImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=2070",
        author: {
            id: "a1",
            name: "MrBike Team",
            image: "https://github.com/shadcn.png"
        },
        category: "industry",
        tags: ["ev", "electric", "market"],
        views: 5400,
        publishedAt: new Date("2026-01-28"),
        updatedAt: new Date("2026-01-28")
    }
];

export function useNews(category?: string) {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate API delay
        const timer = setTimeout(() => {
            if (category && category !== "all") {
                setNews(MOCK_NEWS.filter(n => n.category === category));
            } else {
                setNews(MOCK_NEWS);
            }
            setIsLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [category]);

    return { news, isLoading };
}

export function useNewsArticle(slug: string) {
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            const found = MOCK_NEWS.find(n => n.slug === slug);
            setArticle(found || null);
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [slug]);

    return { article, isLoading };
}
