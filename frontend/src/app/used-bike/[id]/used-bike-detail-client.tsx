"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  CheckCircle,
  Phone,
  MessageCircle,
  Flag,
  ChevronRight,
  ChevronLeft,
  Clock,
  Share2,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsedBike } from "@/hooks/use-used-bikes";
import { cn, formatPrice, formatRelativeTime } from "@/lib/utils";
import { getMockUsedBikes } from "@/lib/mock-adapter";
import { useWishlistStore } from "@/store";

interface UsedBikeDetailClientProps {
  id: string;
}

export function UsedBikeDetailClient({ id }: UsedBikeDetailClientProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { data: bike, isLoading, error } = useUsedBike(id);
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  // Determine if wishlisted
  const isWishlisted = bike ? isInWishlist(bike.id) : false;

  // Similar ads from mock (bike may have similarIds when from mock data)
  const similarBikes = useMemo(() => {
    if (!bike) return [];
    const ids = (bike as { similarIds?: string[] }).similarIds;
    if (!ids?.length) return getMockUsedBikes({ limit: 4 }).data.usedBikes ?? [];
    const { data } = getMockUsedBikes({ ids, limit: ids.length });
    return data.usedBikes ?? [];
  }, [bike]);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !bike) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Bike Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The used bike listing you&apos;re looking for doesn&apos;t exist or
          has been removed.
        </p>
        <Button asChild>
          <Link href="/used-bikes">Browse Used Bikes</Link>
        </Button>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: bike.bikeName,
          text: `Check out this ${bike.bikeName} for sale on MrBikeBD`,
          url: window.location.href,
        });
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap overflow-x-auto">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <Link href="/used-bikes" className="hover:text-foreground">
              Used Bikes
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="text-foreground font-medium truncate">
              {bike.bikeName}
            </span>
          </nav>
        </div>
      </div>

      <section className="container py-6 md:py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] md:aspect-video bg-black rounded-xl overflow-hidden group">
                <Image
                  src={bike.images[activeImageIndex] || bike.thumbnailUrl}
                  alt={`${bike.bikeName} - Image ${activeImageIndex + 1}`}
                  fill
                  className="object-contain"
                  priority
                />

                {/* Navigation Arrows */}
                {bike.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? bike.images.length - 1 : prev - 1,
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === bike.images.length - 1 ? 0 : prev + 1,
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {bike.isVerified && (
                    <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                      <CheckCircle className="h-3 w-3" /> Verified Listing
                    </Badge>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {bike.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto py-1">
                  {bike.images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={cn(
                        "shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all relative",
                        activeImageIndex === index
                          ? "border-primary"
                          : "border-transparent opacity-70 hover:opacity-100",
                      )}
                    >
                      <Image
                        src={img}
                        alt={`Thumb ${index}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Key Specs (Mobile Only) */}
            <div className="lg:hidden space-y-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">{bike.bikeName}</h1>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4" /> {bike.location.city} •{" "}
                  {formatRelativeTime(bike.createdAt)}
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatPrice(bike.price)}
              </div>
            </div>

            {/* Details Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Bike Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Brand</p>
                  <p className="font-medium">{bike.brandName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Model Year
                  </p>
                  <p className="font-medium">{bike.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Kilometers Run
                  </p>
                  <p className="font-medium">
                    {bike.kmDriven.toLocaleString()} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Condition
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {bike.condition}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Accident History
                  </p>
                  <p className="font-medium">
                    {bike.accidentHistory ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Location</p>
                  <p className="font-medium">{bike.location.city}</p>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none text-muted-foreground whitespace-pre-line">
                  {bike.description || "No description provided by the seller."}
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips (Static) */}
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex gap-4">
              <Flag className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-bold text-yellow-800 dark:text-yellow-500 mb-1">
                  Safety Tips
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-yellow-700 dark:text-yellow-600">
                  <li>Meet in a safe, public place.</li>
                  <li>Check the bike documents properly before buying.</li>
                  <li>
                    Don&apos;t make any payments without checking the bike
                    first.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar / Seller Info */}
          <div className="space-y-6">
            {/* Price Card (Desktop) */}
            <Card className="hidden lg:block">
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold mb-2">{bike.bikeName}</h1>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                  <MapPin className="h-4 w-4" /> {bike.location.city} •{" "}
                  <Clock className="h-3 w-3" />{" "}
                  {formatRelativeTime(bike.createdAt)}
                </div>
                <div className="text-3xl font-bold text-primary mb-6">
                  {formatPrice(bike.price)}
                </div>
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full gap-2 text-lg font-bold bg-[#25D366] hover:bg-[#128C7E] text-white"
                  >
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp Seller
                  </Button>
                  <Button size="lg" variant="outline" className="w-full gap-2">
                    <Phone className="h-4 w-4" />
                    {bike.sellerPhone}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seller Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold text-xl text-muted-foreground">
                    {bike.sellerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{bike.sellerName}</p>
                    <p className="text-xs text-muted-foreground">
                      Verified Seller
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="lg:hidden space-y-3">
                  <Button
                    size="lg"
                    className="w-full gap-2 text-lg font-bold bg-[#25D366] hover:bg-[#128C7E] text-white"
                  >
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp Seller
                  </Button>
                  <Button size="lg" variant="outline" className="w-full gap-2">
                    <Phone className="h-4 w-4" />
                    {bike.sellerPhone}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant={isWishlisted ? "default" : "outline"}
                className="flex-1 gap-2"
                onClick={() => toggleWishlist(bike.id)}
              >
                <Heart
                  className={cn("h-4 w-4", isWishlisted && "fill-current")}
                />
                {isWishlisted ? "Saved" : "Save to Wishlist"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
              <Button
                variant="ghost"
                className="flex-1 text-destructive hover:bg-destructive/10"
              >
                <Flag className="h-4 w-4 mr-2" /> Report
              </Button>
            </div>
          </div>
        </div>

        {/* Similar ads */}
        {similarBikes.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <h2 className="text-xl font-semibold mb-4">Similar ads</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {similarBikes
                .filter((b) => b.id !== bike.id)
                .map((b) => (
                  <Link
                    key={b.id}
                    href={`/used-bike/${b.id}`}
                    className="shrink-0 w-48 rounded-lg overflow-hidden border bg-card hover:shadow-md transition-shadow block"
                  >
                    <div className="aspect-[4/3] bg-muted relative">
                      <Image
                        src={b.thumbnailUrl}
                        alt={b.bikeName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm line-clamp-1">
                        {b.bikeName}
                      </p>
                      <p className="text-primary font-semibold text-sm mt-0.5">
                        {formatPrice(b.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {b.kmDriven.toLocaleString()} km • {b.location.city}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-8">
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          <Skeleton className="h-8 w-2/3" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
