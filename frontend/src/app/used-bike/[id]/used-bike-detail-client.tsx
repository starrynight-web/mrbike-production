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
  Calendar,
  Gauge,
  ShieldCheck,
  Zap,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsedBike, useUsedBikes } from "@/hooks/use-used-bikes";
import { cn, formatPrice, formatRelativeTime } from "@/lib/utils";
import { useWishlistStore } from "@/store";
import { UsedBike } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface UsedBikeDetailClientProps {
  id: string;
}

export function UsedBikeDetailClient({ id }: UsedBikeDetailClientProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { data: bike, isLoading, error } = useUsedBike(id);

  const { isInWishlist, toggleWishlist } = useWishlistStore();

  // Determine if wishlisted
  const isWishlisted = bike ? isInWishlist(bike.id) : false;

  // Fetch similar bikes
  const { data: usedBikesResponse } = useUsedBikes({ limit: 4 });
  const similarBikes = useMemo(() => {
    if (!usedBikesResponse?.usedBikes) return [];
    return usedBikesResponse.usedBikes
      .filter((b: UsedBike) => b.id !== id)
      .slice(0, 4);
  }, [usedBikesResponse, id]);

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

  const safetyTips = [
    {
      icon: MapPin,
      text: "Meet in a safe, public place like a police station or mall.",
    },
    {
      icon: ShieldCheck,
      text: "Verify the bike's original registration and BRTC documents.",
    },
    {
      icon: AlertTriangle,
      text: "Never send money or advance payments before seeing the bike.",
    },
    {
      icon: Zap,
      text: "Bring a mechanic to check the engine and overall condition.",
    },
    {
      icon: Info,
      text: "Always take a test ride in a controlled, safe environment.",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Top Bar / Breadcrumb */}
      <div className="bg-background border-b sticky top-[64px] z-30 backdrop-blur-md bg-background/80">
        <div className="container py-3 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href="/used-bikes"
              className="hover:text-primary transition-colors"
            >
              Used Bikes
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium hidden md:inline truncate max-w-[200px]">
              {bike.bikeName}
            </span>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleWishlist(bike.id)}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  isWishlisted && "fill-primary text-primary",
                )}
              />
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6 md:py-10">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
          {/* Main Content Area */}
          <div className="space-y-8">
            {/* Gallery Section */}
            <div className="space-y-4">
              <div className="relative aspect-video bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={bike.images[activeImageIndex] || bike.thumbnailUrl}
                      alt={bike.bikeName}
                      fill
                      className="object-contain"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Verified Badge */}
                {bike.isVerified && (
                  <div className="absolute top-6 left-6 z-10">
                    <Badge className="bg-green-500/90 backdrop-blur-md hover:bg-green-600 px-3 py-1.5 text-sm gap-1.5 shadow-lg border-none">
                      <ShieldCheck className="h-4 w-4" /> Verified Listing
                    </Badge>
                  </div>
                )}

                {/* Navigation Arrows */}
                {bike.images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full shadow-xl pointer-events-auto h-12 w-12"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? bike.images.length - 1 : prev - 1,
                        )
                      }
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full shadow-xl pointer-events-auto h-12 w-12"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === bike.images.length - 1 ? 0 : prev + 1,
                        )
                      }
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {bike.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {bike.images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={cn(
                        "relative shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all",
                        activeImageIndex === index
                          ? "border-primary shadow-md"
                          : "border-transparent opacity-60 hover:opacity-100",
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

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-none shadow-sm bg-background">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Year
                    </p>
                    <p className="font-bold text-lg">{bike.year}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-background">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Mileage
                    </p>
                    <p className="font-bold text-lg">
                      {bike.kmDriven.toLocaleString()} km
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-background">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Condition
                    </p>
                    <p className="font-bold text-lg capitalize">
                      {bike.condition}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-background">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      History
                    </p>
                    <p className="font-bold text-lg">
                      {bike.accidentHistory ? "Accident" : "Clean"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description Card */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-background border-b">
                <CardTitle className="text-xl">
                  Seller&apos;s Description
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-background">
                <div className="prose max-w-none text-muted-foreground leading-relaxed whitespace-pre-line text-lg">
                  {bike.description || "No description provided by the seller."}
                </div>
              </CardContent>
            </Card>

            {/* Similar Ads */}
            {similarBikes.length > 0 && (
              <div className="space-y-6 pt-6">
                <h2 className="text-2xl font-bold">Similar Used Bikes</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {similarBikes.map((b) => (
                    <Link
                      key={b.id}
                      href={`/used-bike/${b.id}`}
                      className="group bg-background rounded-2xl overflow-hidden border border-transparent hover:border-primary transition-all shadow-sm hover:shadow-xl"
                    >
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <Image
                          src={b.thumbnailUrl}
                          alt={b.bikeName}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                          {b.bikeName}
                        </h3>
                        <p className="text-primary font-black mt-1">
                          {formatPrice(b.price)}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-2 font-medium">
                          <MapPin className="h-3 w-3" /> {b.location.city}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Price & Contact Card */}
            <Card className="border-none shadow-xl bg-background overflow-hidden">
              <div className="p-6 space-y-6">
                <div>
                  <h1 className="text-2xl font-black mb-2">{bike.bikeName}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" /> {bike.location.city}
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <Clock className="h-4 w-4" />{" "}
                    {formatRelativeTime(bike.createdAt)}
                  </div>
                </div>

                <div className="text-4xl font-black text-primary tracking-tight">
                  {formatPrice(bike.price)}
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    size="lg"
                    className="w-full h-14 gap-3 text-lg font-bold bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg shadow-green-500/20 rounded-xl"
                  >
                    <MessageCircle className="h-6 w-6" />
                    WhatsApp Seller
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-14 gap-3 text-lg font-bold rounded-xl border-2"
                  >
                    <Phone className="h-5 w-5" />
                    {bike.sellerPhone}
                  </Button>
                </div>
              </div>

              {/* Seller Info Section */}
              <div className="bg-muted/50 p-6 border-t border-muted">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-2xl text-primary shadow-inner">
                    {bike.sellerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{bike.sellerName}</p>
                    <div className="flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full w-fit mt-1">
                      <CheckCircle className="h-3 w-3" /> Verified Seller
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Safety Tips Card - HIGHLIGHTED */}
            <Card className="border-2 border-primary/20 bg-primary/5 shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <ShieldCheck className="h-20 w-20 text-primary" />
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-primary font-black">
                  <ShieldCheck className="h-6 w-6" />
                  Safety First Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {safetyTips.map((tip, idx) => (
                  <div key={idx} className="flex gap-3 items-start group">
                    <div className="mt-1 p-1.5 rounded-lg bg-background shadow-sm border border-primary/10 group-hover:scale-110 transition-transform">
                      <tip.icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm font-medium leading-snug text-muted-foreground group-hover:text-foreground transition-colors">
                      {tip.text}
                    </p>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-primary/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-primary font-bold hover:bg-primary/10"
                    asChild
                  >
                    <Link href="/safety-guide">Read Full Safety Guide</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Report Listing */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/5 font-medium"
              >
                <Flag className="h-4 w-4 mr-2" /> Report this listing
              </Button>
            </div>
          </div>
        </div>
      </div>
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
