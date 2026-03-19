"use client";

import Link from "next/link";
import Image from "next/image";
import { useBrand, useBrandBikes } from "@/hooks/use-brands";
import { BikeCard } from "@/components/bikes/bike-card";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ArrowLeft, 
  Info, 
  MapPin, 
  Bike as BikeIcon 
} from "lucide-react";
import { Bike as BikeType } from "@/types";
import { ALLOWED_BRANDS } from "@/config/constants";

interface BrandDetailClientProps {
  slug: string;
  initialData?: any;
}

export function BrandDetailClient({ slug, initialData }: BrandDetailClientProps) {
  const { data: brand, isLoading: isBrandLoading } = useBrand(slug);
  const { data: bikes = [], isLoading: isBikesLoading } = useBrandBikes(slug, initialData?.results || (Array.isArray(initialData) ? initialData : undefined));

  if (isBrandLoading || isBikesLoading) {
    return <BrandDetailLoading />;
  }

  if (!brand) {
    return (
      <div className="w-full px-4 md:px-8 py-20 text-center flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4">Brand Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The motorcycle manufacturer you are looking for is not listed in our
          database.
        </p>
        <Button asChild>
          <Link href="/brands">Browse All Brands</Link>
        </Button>
      </div>
    );
  }

  const brandLogo =
    brand?.logo ||
    ALLOWED_BRANDS.find((b) => b.slug === brand?.slug)?.logo ||
    "";

  return (
    <div className="min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="w-full px-4 md:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href="/brands"
              className="hover:text-foreground flex items-center"
            >
              <ArrowLeft className="mr-1 h-3 w-3" /> Brands
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
            <span className="text-foreground font-medium">{brand.name}</span>
          </nav>
        </div>
      </div>

      {/* Brand Hero Header */}
      <div className="bg-muted/50 border-b relative overflow-hidden">
        {/* Background Watermark/Blur */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {brandLogo && (
            <div className="absolute -right-20 -top-20 w-[600px] h-[600px] opacity-[0.03] rotate-12">
              <Image
                src={brandLogo}
                alt=""
                fill
                className="object-contain grayscale"
              />
            </div>
          )}
        </div>

        <div className="w-full px-4 md:px-8 py-8 md:py-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="w-full md:w-auto flex-shrink-0 flex justify-center md:block">
              <div className="relative w-32 h-32 md:w-48 md:h-48 bg-card/80 backdrop-blur-sm border rounded-2xl p-4 flex items-center justify-center shadow-sm">
                {brandLogo ? (
                  <Image
                    src={brandLogo}
                    alt={brand.name}
                    fill
                    className="object-contain p-2"
                    priority
                  />
                ) : (
                  <BikeIcon className="w-16 h-16 text-muted-foreground/30" />
                )}
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                  {brand.name} Bikes
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{brand.country || 'International'}</span>
                  </div>
                  <div className="hidden md:block w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <div className="flex items-center gap-1.5">
                    <BikeIcon className="h-4 w-4" />
                    <span>{brand.bikeCount || bikes.length} Models Available</span>
                  </div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto md:mx-0">
                {brand.description ||
                  `Explore the complete lineup of ${brand.name} motorcycles available in Bangladesh. Find the latest prices, specifications, and features of all ${brand.name} bikes.`}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                <Button variant="outline" size="sm">
                  <Info className="mr-2 h-4 w-4" /> Official Website
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full px-4 md:px-8 py-12 space-y-12">
        {/* Bike List */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Available Models</h2>
            <span className="text-muted-foreground text-sm">
              {bikes.length} bikes found
            </span>
          </div>

          {bikes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bikes.map((bike) => (
                <BikeCard key={bike.id} bike={bike as BikeType} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-muted/20 rounded-2xl border-2 border-dashed">
              <p className="text-muted-foreground">
                No bikes found for this brand yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BrandDetailLoading() {
  return (
    <div className="w-full px-4 md:px-8 py-12">
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
