"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Bike, Newspaper, Store, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { debounce } from "@/lib/utils";
import { searchService } from "@/lib/api";
import type { Bike as BikeType, UsedBike, NewsArticle } from "@/types";

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface SearchResults {
    bikes: BikeType[];
    usedBikes: UsedBike[];
    news: NewsArticle[];
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResults>({
        bikes: [],
        usedBikes: [],
        news: [],
    });

    // Debounced search function
    const performSearch = useCallback(
        debounce(async (searchQuery: string) => {
            if (searchQuery.length < 2) {
                setResults({ bikes: [], usedBikes: [], news: [] });
                setIsLoading(false);
                return;
            }

            try {
                const response = await searchService.search(searchQuery);
                if (response.success && response.data) {
                    setResults({
                        bikes: response.data.bikes || [],
                        usedBikes: response.data.usedBikes || [],
                        news: response.data.news || [],
                    });
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300),
        []
    );

    useEffect(() => {
        if (query.length >= 2) {
            setIsLoading(true);
            performSearch(query);
        } else {
            setResults({ bikes: [], usedBikes: [], news: [] });
        }
    }, [query, performSearch]);

    // Reset on close
    useEffect(() => {
        if (!open) {
            setQuery("");
            setResults({ bikes: [], usedBikes: [], news: [] });
        }
    }, [open]);

    const handleSelect = (type: string, slug: string) => {
        onOpenChange(false);
        router.push(`/${type}/${slug}`);
    };

    const hasResults =
        results.bikes.length > 0 ||
        results.usedBikes.length > 0 ||
        results.news.length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl gap-0 p-0">
                <DialogHeader className="p-4 pb-0">
                    <DialogTitle className="sr-only">Search</DialogTitle>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search bikes, news, and more..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10 pr-10 h-12 text-lg"
                            autoFocus
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] p-4">
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {!isLoading && query.length >= 2 && !hasResults && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No results found for &quot;{query}&quot;</p>
                            <p className="text-sm mt-1">Try different keywords</p>
                        </div>
                    )}

                    {!isLoading && hasResults && (
                        <div className="space-y-6">
                            {/* Bikes Results */}
                            {results.bikes.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                                        <Bike className="h-4 w-4" />
                                        Bikes
                                    </div>
                                    <div className="space-y-2">
                                        {results.bikes.slice(0, 5).map((bike) => (
                                            <button
                                                key={bike.id}
                                                onClick={() => handleSelect("bike", bike.slug)}
                                                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent text-left transition-colors"
                                            >
                                                <img
                                                    src={bike.thumbnailUrl}
                                                    alt={bike.name}
                                                    className="h-12 w-16 object-cover rounded-md bg-muted"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{bike.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {bike.brand.name} • {bike.category}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Used Bikes Results */}
                            {results.usedBikes.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                                        <Store className="h-4 w-4" />
                                        Used Bikes
                                    </div>
                                    <div className="space-y-2">
                                        {results.usedBikes.slice(0, 5).map((bike) => (
                                            <button
                                                key={bike.id}
                                                onClick={() => handleSelect("used-bike", bike.id)}
                                                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent text-left transition-colors"
                                            >
                                                <img
                                                    src={bike.thumbnailUrl}
                                                    alt={bike.bikeName}
                                                    className="h-12 w-16 object-cover rounded-md bg-muted"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{bike.bikeName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {bike.year} • {bike.kmDriven.toLocaleString()} km •{" "}
                                                        {bike.location.city}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* News Results */}
                            {results.news.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                                        <Newspaper className="h-4 w-4" />
                                        News
                                    </div>
                                    <div className="space-y-2">
                                        {results.news.slice(0, 3).map((article) => (
                                            <button
                                                key={article.id}
                                                onClick={() => handleSelect("news", article.slug)}
                                                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent text-left transition-colors"
                                            >
                                                <img
                                                    src={article.featuredImage}
                                                    alt={article.title}
                                                    className="h-12 w-16 object-cover rounded-md bg-muted"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{article.title}</p>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {article.excerpt}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quick Links when empty */}
                    {!query && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">Quick Links</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: "All Bikes", href: "/bikes" },
                                    { label: "Used Bikes", href: "/used-bikes" },
                                    { label: "Compare", href: "/compare" },
                                    { label: "Latest News", href: "/news" },
                                ].map((link) => (
                                    <button
                                        key={link.href}
                                        onClick={() => {
                                            onOpenChange(false);
                                            router.push(link.href);
                                        }}
                                        className="p-3 rounded-lg bg-accent hover:bg-accent/80 text-sm font-medium transition-colors"
                                    >
                                        {link.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
