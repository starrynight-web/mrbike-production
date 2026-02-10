"use client";

import Link from "next/link";
import Image from "next/image";
import { useBrands } from "@/hooks/use-brands";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Bike } from "lucide-react";

export function BrandsClient() {
    const { data: brands = [], isLoading } = useBrands();

    if (isLoading) {
        return <BrandsLoadingSkeleton />;
    }

    return (
        <div className="container py-12 md:py-20 max-w-7xl mx-auto text-center md:text-left">
            <div className="mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Browse by Brand</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto md:mx-0">
                    Find your dream bike from the top manufacturers available in Bangladesh.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
                {brands.map((brand) => (
                    <Link key={brand.id} href={`/brands/${brand.slug}`} className="group outline-none">
                        <Card className="h-full border-2 border-transparent hover:border-primary/10 hover:shadow-lg transition-all duration-300 bg-card/50 hover:bg-card">
                            <CardContent className="p-6 flex flex-col items-center justify-center h-full gap-4 min-h-[180px]">
                                <div className="relative w-32 h-20 md:w-40 md:h-24 grayscale group-hover:grayscale-0 transition-all duration-300 flex items-center justify-center">
                                    {brand.logo ? (
                                        <Image
                                            src={brand.logo}
                                            alt={`${brand.name} logo`}
                                            fill
                                            className="object-contain" // Logos need contain
                                        />
                                    ) : (
                                        <Bike className="w-12 h-12 text-muted-foreground/30" />
                                    )}
                                </div>
                                <div className="text-center space-y-1">
                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{brand.name}</h3>
                                    <Badge variant="secondary" className="text-xs font-normal">
                                        {brand.bikeCount} Bikes
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="mt-20 p-8 md:p-12 rounded-2xl bg-muted/30 text-center space-y-6">
                <h3 className="text-2xl font-bold">Can&apos;t decide which brand?</h3>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Compare bikes from different brands side by side to find the perfect match for your needs and budget.
                </p>
                <div className="flex justify-center">
                    <Link
                        href="/compare"
                        className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-8 py-2"
                    >
                        Compare Bikes <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function BrandsLoadingSkeleton() {
    return (
        <div className="container py-12 md:py-20">
            <div className="h-10 w-64 mb-4 bg-muted rounded" />
            <div className="h-6 w-96 mb-12 bg-muted rounded" />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl border p-6 flex items-center justify-center">
                        <div className="h-16 w-32 bg-muted rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
