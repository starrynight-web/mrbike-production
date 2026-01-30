"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Heart,
    Share2,
    ChevronLeft,
    ChevronRight,
    Fuel,
    Gauge,
    Zap,
    Star,
    Calculator,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatPrice, calculateEMI } from "@/lib/utils";
import { useBike, useSimilarBikes, useUsedBikesNearBudget, useBikeReviews } from "@/hooks/use-bikes";
import { useWishlistStore, useCompareStore } from "@/store";
import { EMI_CONFIG } from "@/config/constants";
import { BikeCard } from "@/components/bikes";
import type { Bike } from "@/types";

interface BikeDetailClientProps {
    slug: string;
}

export function BikeDetailClient({ slug }: BikeDetailClientProps) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [emiMonths, setEmiMonths] = useState(EMI_CONFIG.defaultTenureMonths);

    // Fetch bike data
    const { data: bike, isLoading, error } = useBike(slug);
    const { data: similarBikes } = useSimilarBikes(slug);
    const { data: usedBikesNearBudget } = useUsedBikesNearBudget(slug);
    const { data: reviews } = useBikeReviews(bike?.id || "");

    // Store hooks
    const { isInWishlist, toggleWishlist } = useWishlistStore();
    const { isBikeSelected, addBike, removeBike } = useCompareStore();

    if (isLoading) {
        return <BikeDetailSkeleton />;
    }

    if (error || !bike) {
        return (
            <div className="container py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Bike Not Found</h1>
                <p className="text-muted-foreground mb-8">
                    The bike you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <Button asChild>
                    <Link href="/bikes">Browse All Bikes</Link>
                </Button>
            </div>
        );
    }

    const isWishlisted = isInWishlist(bike.id);
    const isInCompare = isBikeSelected(bike.id);
    const basePrice = bike.priceRange.min;
    const downPayment = basePrice * (EMI_CONFIG.downPaymentPercent / 100);
    const loanAmount = basePrice - downPayment;
    const emi = calculateEMI(loanAmount, EMI_CONFIG.defaultInterestRate, emiMonths);

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: bike.name,
                text: `Check out ${bike.name} on MrBikeBD`,
                url: window.location.href,
            });
        } else {
            await navigator.clipboard.writeText(window.location.href);
            // TODO: Show toast
        }
    };

    const handleCompareToggle = () => {
        if (isInCompare) {
            removeBike(bike.id);
        } else {
            addBike(bike);
        }
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Breadcrumb */}
            <div className="bg-muted/50 border-b">
                <div className="container py-3">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href="/bikes" className="hover:text-foreground">Bikes</Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href={`/brands/${bike.brand.slug}`} className="hover:text-foreground">
                            {bike.brand.name}
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium">{bike.name}</span>
                    </nav>
                </div>
            </div>

            {/* Hero Section */}
            <section className="container py-6 md:py-10">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                            <motion.img
                                key={activeImageIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                src={bike.images[activeImageIndex] || "/placeholder-bike.webp"}
                                alt={`${bike.name} - Image ${activeImageIndex + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Navigation Arrows */}
                            {bike.images.length > 1 && (
                                <>
                                    <button
                                        onClick={() =>
                                            setActiveImageIndex((prev) =>
                                                prev === 0 ? bike.images.length - 1 : prev - 1
                                            )
                                        }
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            setActiveImageIndex((prev) =>
                                                prev === bike.images.length - 1 ? 0 : prev + 1
                                            )
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </>
                            )}

                            {/* Category Badge */}
                            <Badge className="absolute top-4 left-4 capitalize">
                                {bike.category}
                            </Badge>
                        </div>

                        {/* Thumbnails */}
                        {bike.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                                {bike.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImageIndex(index)}
                                        className={cn(
                                            "shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all",
                                            activeImageIndex === index
                                                ? "border-primary"
                                                : "border-transparent opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bike Info */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div>
                            <p className="text-muted-foreground mb-1">{bike.brand.name}</p>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{bike.name}</h1>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{bike.rating.average.toFixed(1)}</span>
                                    <span className="text-muted-foreground">
                                        ({bike.rating.count} reviews)
                                    </span>
                                </div>
                                {bike.isElectric && (
                                    <Badge variant="secondary">
                                        <Zap className="h-3 w-3 mr-1" />
                                        Electric
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Price */}
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                            <p className="text-sm text-muted-foreground mb-1">Price in Bangladesh</p>
                            <p className="text-3xl font-bold text-primary">
                                {formatPrice(bike.priceRange.min)}
                                {bike.priceRange.max > bike.priceRange.min && (
                                    <span className="text-lg font-normal text-muted-foreground ml-2">
                                        - {formatPrice(bike.priceRange.max)}
                                    </span>
                                )}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                *Ex-showroom price
                            </p>
                        </div>

                        {/* Quick Specs */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 rounded-lg bg-muted">
                                <Fuel className="h-6 w-6 mx-auto mb-2 text-primary" />
                                <p className="font-semibold">{bike.specs.mileage} kmpl</p>
                                <p className="text-xs text-muted-foreground">Mileage</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted">
                                <Gauge className="h-6 w-6 mx-auto mb-2 text-primary" />
                                <p className="font-semibold">{bike.specs.topSpeed} kmph</p>
                                <p className="text-xs text-muted-foreground">Top Speed</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted">
                                <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
                                <p className="font-semibold">{bike.specs.displacement}cc</p>
                                <p className="text-xs text-muted-foreground">Engine</p>
                            </div>
                        </div>

                        {/* EMI Calculator */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Calculator className="h-4 w-4" />
                                    EMI Calculator
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Down payment ({EMI_CONFIG.downPaymentPercent}%)
                                        </p>
                                        <p className="font-medium">{formatPrice(downPayment)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Monthly EMI</p>
                                        <p className="text-xl font-bold text-primary">
                                            {formatPrice(emi)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {[12, 24, 36, 48, 60].map((months) => (
                                        <button
                                            key={months}
                                            onClick={() => setEmiMonths(months)}
                                            className={cn(
                                                "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                                                emiMonths === months
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted hover:bg-muted/80"
                                            )}
                                        >
                                            {months}m
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-3">
                                    *At {EMI_CONFIG.defaultInterestRate}% interest rate
                                </p>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                variant={isWishlisted ? "default" : "outline"}
                                size="lg"
                                className="flex-1"
                                onClick={() => toggleWishlist(bike.id)}
                            >
                                <Heart
                                    className={cn("h-5 w-5 mr-2", isWishlisted && "fill-current")}
                                />
                                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                            </Button>
                            <Button
                                variant={isInCompare ? "default" : "outline"}
                                size="lg"
                                className="flex-1"
                                onClick={handleCompareToggle}
                            >
                                <Check
                                    className={cn("h-5 w-5 mr-2", !isInCompare && "opacity-0")}
                                />
                                {isInCompare ? "In Compare" : "Add to Compare"}
                            </Button>
                            <Button variant="outline" size="lg" onClick={handleShare}>
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs Section */}
            <section className="container py-8">
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                        {["Overview", "Variants", "Specs", "Reviews"].map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab.toLowerCase()}
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                            >
                                {tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <div className="prose max-w-none">
                            <p className="text-muted-foreground leading-relaxed">
                                {bike.description || `The ${bike.name} is a ${bike.category} motorcycle from ${bike.brand.name}. It features a ${bike.specs.displacement}cc ${bike.specs.engineType} engine producing ${bike.specs.maxPower} and ${bike.specs.maxTorque}. With ${bike.specs.abs} ABS and ${bike.specs.mileage} kmpl mileage, it's designed for riders who want ${bike.category === 'sport' ? 'performance and style' : bike.category === 'commuter' ? 'efficiency and reliability' : 'versatility and comfort'}.`}
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="variants" className="mt-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">Variant</th>
                                        <th className="text-left py-3 px-4">Price</th>
                                        <th className="text-left py-3 px-4">Color</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bike.variants.map((variant) => (
                                        <tr key={variant.id} className="border-b hover:bg-muted/50">
                                            <td className="py-3 px-4 font-medium">{variant.name}</td>
                                            <td className="py-3 px-4">{formatPrice(variant.price)}</td>
                                            <td className="py-3 px-4">{variant.color}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>

                    <TabsContent value="specs" className="mt-6">
                        <SpecsTable specs={bike.specs} />
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-6">
                        <ReviewsSection bikeId={bike.id} reviews={reviews || []} rating={bike.rating} />
                    </TabsContent>
                </Tabs>
            </section>

            {/* Similar Bikes Section */}
            {similarBikes && similarBikes.length > 0 && (
                <section className="container py-8">
                    <h2 className="text-2xl font-bold mb-6">Similar Bikes</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {similarBikes.slice(0, 4).map((rec) => (
                            <BikeCard key={rec.bike.id} bike={rec.bike} showCompare={false} />
                        ))}
                    </div>
                </section>
            )}

            {/* Used Bikes Near Budget Section */}
            {usedBikesNearBudget && usedBikesNearBudget.length > 0 && (
                <section className="container py-8 bg-muted/30">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">Used Bikes Near Your Budget</h2>
                            <p className="text-muted-foreground">
                                Get more value with premium used options
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/used-bikes">View All</Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {usedBikesNearBudget.slice(0, 4).map((rec) => (
                            <Card key={rec.usedBike.id} className="overflow-hidden">
                                <div className="aspect-[4/3] bg-muted">
                                    <img
                                        src={rec.usedBike.thumbnailUrl}
                                        alt={rec.usedBike.bikeName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground">{rec.usedBike.year}</p>
                                    <h3 className="font-semibold line-clamp-1">{rec.usedBike.bikeName}</h3>
                                    <p className="text-primary font-bold">{formatPrice(rec.usedBike.price)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {rec.usedBike.kmDriven.toLocaleString()} km • {rec.usedBike.location.city}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

// Specs Table Component
function SpecsTable({ specs }: { specs: Bike["specs"] }) {
    const specGroups = [
        {
            title: "Engine & Performance",
            items: [
                { label: "Engine Type", value: specs.engineType },
                { label: "Displacement", value: `${specs.displacement}cc` },
                { label: "Max Power", value: specs.maxPower },
                { label: "Max Torque", value: specs.maxTorque },
                { label: "Cooling", value: specs.cooling },
                { label: "Fuel System", value: specs.fuelSystem },
                { label: "Transmission", value: specs.transmission },
                { label: "Top Speed", value: `${specs.topSpeed} kmph` },
                { label: "Mileage", value: `${specs.mileage} kmpl` },
            ],
        },
        {
            title: "Dimensions & Weight",
            items: [
                { label: "Length", value: `${specs.length} mm` },
                { label: "Width", value: `${specs.width} mm` },
                { label: "Height", value: `${specs.height} mm` },
                { label: "Wheelbase", value: `${specs.wheelbase} mm` },
                { label: "Ground Clearance", value: `${specs.groundClearance} mm` },
                { label: "Seat Height", value: `${specs.seatHeight} mm` },
                { label: "Kerb Weight", value: `${specs.kerbWeight} kg` },
                { label: "Fuel Capacity", value: `${specs.fuelCapacity} L` },
            ],
        },
        {
            title: "Brakes & Suspension",
            items: [
                { label: "Front Brake", value: specs.frontBrake },
                { label: "Rear Brake", value: specs.rearBrake },
                { label: "ABS", value: specs.abs },
                { label: "Front Suspension", value: specs.frontSuspension },
                { label: "Rear Suspension", value: specs.rearSuspension },
            ],
        },
        {
            title: "Wheels & Tyres",
            items: [
                { label: "Front Tyre", value: specs.frontTyre },
                { label: "Rear Tyre", value: specs.rearTyre },
                { label: "Wheel Type", value: specs.wheelType },
            ],
        },
    ];

    return (
        <div className="grid md:grid-cols-2 gap-8">
            {specGroups.map((group) => (
                <div key={group.title}>
                    <h3 className="font-semibold text-lg mb-4">{group.title}</h3>
                    <div className="space-y-3">
                        {group.items.map((item) => (
                            <div key={item.label} className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">{item.label}</span>
                                <span className="font-medium">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// Reviews Section Component
function ReviewsSection({
    bikeId,
    reviews,
    rating,
}: {
    bikeId: string;
    reviews: any[];
    rating: { average: number; count: number };
}) {
    return (
        <div>
            <div className="flex items-center gap-8 mb-8">
                <div className="text-center">
                    <p className="text-5xl font-bold">{rating.average.toFixed(1)}</p>
                    <div className="flex justify-center my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={cn(
                                    "h-5 w-5",
                                    star <= Math.round(rating.average)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                )}
                            />
                        ))}
                    </div>
                    <p className="text-muted-foreground">{rating.count} reviews</p>
                </div>
                <Separator orientation="vertical" className="h-20" />
                <div className="flex-1">
                    {/* Rating distribution - placeholder */}
                    {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center gap-2 mb-1">
                            <span className="w-3 text-sm">{star}</span>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full bg-yellow-400 rounded-full"
                                    style={{ width: `${star === 5 ? 60 : star === 4 ? 25 : 15}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Button>Write a Review</Button>

            {reviews.length === 0 && (
                <p className="text-muted-foreground mt-8">
                    No reviews yet. Be the first to review this bike!
                </p>
            )}
        </div>
    );
}

// Loading Skeleton
function BikeDetailSkeleton() {
    return (
        <div className="container py-10">
            <div className="grid lg:grid-cols-2 gap-8">
                <div>
                    <Skeleton className="aspect-[4/3] rounded-xl" />
                    <div className="flex gap-2 mt-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="w-20 h-16 rounded-lg" />
                        ))}
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-10 w-64 mb-2" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-24 rounded-xl" />
                    <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-24 rounded-lg" />
                        <Skeleton className="h-24 rounded-lg" />
                        <Skeleton className="h-24 rounded-lg" />
                    </div>
                    <Skeleton className="h-32 rounded-xl" />
                    <div className="flex gap-3">
                        <Skeleton className="h-12 flex-1" />
                        <Skeleton className="h-12 flex-1" />
                        <Skeleton className="h-12 w-12" />
                    </div>
                </div>
            </div>
        </div>
    );
}
