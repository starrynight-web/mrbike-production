"use client";

import Link from "next/link";
import Image from "next/image";
import { useBrand, useBrandBikes } from "@/hooks/use-brands";
import { BikeCard } from "@/components/bikes/bike-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, ArrowLeft, Info, MapPin } from "lucide-react";
import { Bike } from "@/types";

interface BrandDetailClientProps {
    slug: string;
}

export function BrandDetailClient({ slug }: BrandDetailClientProps) {
    const { brand, isLoading: isBrandLoading } = useBrand(slug);
    const { bikes, isLoading: isBikesLoading } = useBrandBikes(slug);

    if (isBrandLoading || isBikesLoading) {
        return <BrandDetailLoading />;
    }

    if (!brand) {
        return (
            <div className="container py-20 text-center flex flex-col items-center">
                <h1 className="text-3xl font-bold mb-4">Brand Not Found</h1>
                <p className="text-muted-foreground mb-8">
                    The motorcycle manufacturer you are looking for is not listed in our database.
                </p>
                <Button asChild>
                    <Link href="/brands">Browse All Brands</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Breadcrumb */}
            <div className="bg-muted/30 border-b">
                <div className="container py-3">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/brands" className="hover:text-foreground flex items-center">
                            <ArrowLeft className="mr-1 h-3 w-3" /> Brands
                        </Link>
                        <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
                        <span className="text-foreground font-medium">{brand.name}</span>
                    </nav>
                </div>
            </div>

            <div className="container py-8 md:py-12 space-y-12">

                {/* Brand Hero */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-auto flex-shrink-0 flex justify-center md:block">
                        <div className="relative w-40 h-40 md:w-56 md:h-56 bg-card border rounded-2xl p-6 flex items-center justify-center shadow-sm">
                            <Image
                                src={brand.logo}
                                alt={brand.name}
                                fill
                                className="object-contain p-4"
                                priority
                            />
                        </div>
                    </div>
                    <div className="space-y-4 text-center md:text-left flex-1">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{brand.name} Bikes</h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{brand.country}</span>
                                <span>•</span>
                                <span>{brand.bikeCount} Models Available</span>
                            </div>
                        </div>
                        <p className="text-lg text-muted-foreground max-w-3xl">
                            {brand.description || `Explore the complete lineup of ${brand.name} motorcycles available in Bangladesh. Find the latest prices, specifications, and features of all ${brand.name} bikes.`}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                            <Button variant="outline" size="sm">
                                <Info className="mr-2 h-4 w-4" /> Official Website
                            </Button>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Bike List */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Available Models</h2>
                        <span className="text-muted-foreground text-sm">{bikes.length} bikes found</span>
                    </div>

                    {bikes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {bikes.map((bike) => (
                                <BikeCard key={bike.id} bike={bike as Bike} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-muted/20 rounded-2xl border-2 border-dashed">
                            <p className="text-muted-foreground">No bikes found for this brand yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function BrandDetailLoading() {
    return (
        <div className="container py-12">
            <div className="flex flex-col md:flex-row gap-8 mb-12">
                <div className="h-56 w-56 bg-muted rounded-2xl shrink-0 mx-auto md:mx-0" />
                <div className="space-y-4 w-full text-center md:text-left">
                    <div className="h-12 w-64 bg-muted rounded mx-auto md:mx-0" />
                    <div className="h-6 w-48 bg-muted rounded mx-auto md:mx-0" />
                    <div className="h-20 w-full max-w-2xl bg-muted rounded mx-auto md:mx-0" />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-muted rounded-xl" />
                ))}
            </div>
        </div>
    );
}
