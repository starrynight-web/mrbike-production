"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  Share2,
  Heart,
  Calendar,
  Gauge,
  Zap,
  CheckCircle2,
  Bike,
  Shield,
  FileText,
  User,
  Star,
  Store,
  Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsedBike, useUsedBikes } from "@/hooks/use-used-bikes";
import { cn, formatPrice } from "@/lib/utils";
import { useWishlistStore } from "@/store";
import { UsedBike } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface UsedBikeDetailClientProps {
  slug: string;
  initialData?: UsedBike;
}

export function UsedBikeDetailClient({ slug, initialData }: UsedBikeDetailClientProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const handleImageError = (src: string) => {
    setBrokenImages(prev => {
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  };

  const { data: bike, isLoading, error } = useUsedBike(slug, initialData);
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const isWishlisted = bike ? isInWishlist(bike.id) : false;

  const { data: usedBikesResponse } = useUsedBikes({ limit: 4 });
  const similarBikes = useMemo(() => {
    if (!usedBikesResponse?.usedBikes || !bike) return [];
    return usedBikesResponse.usedBikes
      .filter((b: UsedBike) => b.id !== bike.id && b.slug !== slug)
      .slice(0, 4);
  }, [usedBikesResponse, bike, slug]);

  const handleCall = (phone: string) => {
    if (typeof window !== "undefined") {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleWhatsApp = (phone: string, bikeName: string) => {
    if (typeof window !== "undefined") {
      const cleanPhone = phone.replace(/[^\d]/g, "");
      const message = encodeURIComponent(
        `Assalamu Alaikum. I'm interested in your "${bikeName}" listed on MrBikeBD. Is it still available?`
      );
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share && bike) {
      try {
        await navigator.share({
          title: bike.bikeName,
          text: `Check out this ${bike.bikeName} on MrBikeBD!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share failed", err);
      }
    }
  };

  if (isLoading) return <DetailSkeleton />;

  if (error || !bike) {
    return (
      <div className="w-full px-4 md:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
        <p className="text-muted-foreground mb-8">
          This listing may have been sold or removed by the seller.
        </p>
        <Button asChild>
          <Link href="/used-bikes">Browse All Bikes</Link>
        </Button>
      </div>
    );
  }

  const contactPhone = bike.primaryContactNumber || bike.sellerPhone;
  const whatsappPhone = bike.whatsappNumber || contactPhone;
  const defaultImage = bike.thumbnailUrl || "/placeholder-bike.png";

  const displayImages = bike.images && bike.images.length > 0 ? bike.images : [defaultImage];

  return (
    <div className="min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b">
        <div className="w-full px-4 md:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/used-bikes" className="hover:text-foreground">
              Used Bikes
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{bike.bikeName}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="w-full px-4 md:px-8 py-6 md:py-10">
        {/* Top Row: Name/Rating (left) + Action Buttons (right) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-muted-foreground text-sm mb-1">Used Bike</p>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-3">
              {bike.bikeName}
              {bike.isVerified && (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                  Verified
                </Badge>
              )}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              type="button"
              variant={isWishlisted ? "default" : "outline"}
              size="sm"
              onClick={() => toggleWishlist(bike.id)}
              className="gap-2"
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
              {isWishlisted ? "Saved" : "Save"}
            </Button>
          </div>
        </div>

        {/* Main Content: Image Carousel + Seller Panel */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Image Carousel (takes 1 column) */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative h-[240px] sm:h-[320px] lg:h-[400px] w-full rounded-xl overflow-hidden bg-muted">
              <motion.div
                key={activeImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full relative"
              >
                <Image
                  src={brokenImages.has(displayImages[activeImageIndex]) ? defaultImage : displayImages[activeImageIndex]}
                  alt={`${bike.bikeName} - Image ${activeImageIndex + 1}`}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const src = (e.target as HTMLImageElement).src;
                    if (src) handleImageError(src);
                  }}
                />
              </motion.div>

              {/* Navigation Arrows */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white text-sm font-medium">
                {activeImageIndex + 1} / {displayImages.length}
              </div>
            </div>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {displayImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={cn(
                      "relative shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden border-2 transition-all",
                      activeImageIndex === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={brokenImages.has(img) ? defaultImage : img}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                      crossOrigin="anonymous"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Price, Seller & Quick Specs */}
          <div className="flex flex-col gap-4">
            
            {/* Price Information Block */}
            <div className="bg-card border rounded-xl p-5 overflow-hidden">
              <h3 className="font-semibold mb-4 text-sm text-muted-foreground">Asking Price</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl sm:text-3xl font-bold text-primary whitespace-nowrap">
                  ৳{(bike.price ?? 0).toLocaleString()}
                </span>
                {bike.isUrgent && (
                  <Badge variant="destructive" className="uppercase tracking-wider text-xs px-2 py-1">
                    Urgent
                  </Badge>
                )}
              </div>
            </div>

            {/* Seller Information Block */}
            <div className="bg-card border rounded-xl p-5 flex flex-col gap-4">
              <h3 className="font-semibold text-sm">Seller Information</h3>
              <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg">
                {bike.shop_info ? (
                  <Link href={`/shop/${bike.shop_info.slug}`} className="flex items-center gap-4 group flex-1">
                    <div className="h-14 w-14 rounded-lg bg-background border flex items-center justify-center overflow-hidden shrink-0 group-hover:border-primary transition-colors">
                      {bike.shop_info.logo ? (
                        <img src={bike.shop_info.logo} alt={bike.shop_info.name} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold group-hover:text-primary transition-colors">{bike.shop_info.name}</p>
                        {bike.shop_info.is_verified && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {bike.shop_info.location_city}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <>
                    <div className="h-14 w-14 rounded-lg bg-background border flex items-center justify-center shrink-0">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Private Seller</p>
                      <p className="font-bold">{bike.sellerName}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {bike.location.city}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Contact Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <Button
                  size="lg"
                  className="w-full font-bold text-base"
                  onClick={() => handleCall(contactPhone)}
                >
                  <Phone className="mr-2 h-4 w-4" /> Reveal Number
                </Button>
                
                {whatsappPhone && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full font-bold text-base border-primary/20 hover:bg-primary/5 text-primary"
                    onClick={() => handleWhatsApp(whatsappPhone, bike.bikeName)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Specs Grid (Matching New Bikes "Quick Specifications" layout) */}
            <div className="bg-card border rounded-xl p-4 flex-1">
              <h3 className="font-semibold text-sm mb-3">At a glance</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Manufacturing Year", value: bike.year, icon: Calendar },
                  { label: "Total Mileage", value: `${(bike.kmDriven ?? 0).toLocaleString()} km`, icon: Gauge },
                  { label: "Engine Displacement", value: bike.engineCC ? `${bike.engineCC} CC` : "N/A", icon: Zap },
                  { label: "Location", value: bike.location.city, icon: MapPin },
                ].map((spec, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-muted/50 border border-transparent min-w-0 flex flex-col justify-center"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <spec.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">
                        {spec.label}
                      </p>
                    </div>
                    <p className="font-bold text-sm truncate pl-5">
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Specs Section & Overview */}
      <section className="w-full px-4 md:px-8 py-8 border-t border-border mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* Detailed Specs Table */}
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 bg-muted/30 border-b">
                <h3 className="text-lg font-bold">Technical details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Registration Column */}
                <div className="p-0 md:border-r">
                  <h4 className="font-semibold text-sm p-4 bg-muted/10 border-b">Registration</h4>
                  <div className="divide-y text-sm">
                    <div className="flex justify-between p-4 hover:bg-muted/30 transition-colors">
                      <span className="text-muted-foreground">Registration Year</span>
                      <span className="font-semibold">{bike.registrationYear || bike.year || "Unregistered"}</span>
                    </div>
                    <div className="flex justify-between p-4 hover:bg-muted/30 transition-colors">
                      <span className="text-muted-foreground">Registration Type</span>
                      <span className="font-semibold">{bike.registrationType || "Not Specified"}</span>
                    </div>
                    <div className="flex justify-between p-4 hover:bg-muted/30 transition-colors">
                      <span className="text-muted-foreground">Original Papers</span>
                      <span className="font-semibold">{bike.hasOriginalPapers ? "Available" : "Not Available"}</span>
                    </div>
                    <div className="flex justify-between p-4 hover:bg-muted/30 transition-colors">
                      <span className="text-muted-foreground">Ownership History</span>
                      <span className="font-semibold">{`${bike.ownershipCount || 1}${bike.ownershipCount === 1 ? 'st' : bike.ownershipCount === 2 ? 'nd' : bike.ownershipCount === 3 ? 'rd' : 'th'} Owner`}</span>
                    </div>
                  </div>
                </div>

                {/* Condition Column */}
                <div className="p-0">
                  <h4 className="font-semibold text-sm p-4 bg-muted/10 border-b">Condition</h4>
                  <div className="divide-y text-sm">
                    <div className="flex justify-between p-4 hover:bg-muted/30 transition-colors">
                      <span className="text-muted-foreground">Overall Condition</span>
                      <span className="font-semibold capitalize">{bike.condition || "Good"}</span>
                    </div>
                    <div className="flex justify-between p-4 hover:bg-muted/30 transition-colors">
                      <span className="text-muted-foreground">Engine State</span>
                      <span className="font-semibold capitalize">{bike.engineCondition || "Good"}</span>
                    </div>
                    <div className="flex justify-between p-4 hover:bg-muted/30 transition-colors">
                      <span className="text-muted-foreground">Body State</span>
                      <span className="font-semibold capitalize">{bike.bodyCondition || "Good"}</span>
                    </div>
                    <div className="flex justify-between p-4 hover:bg-muted/30 transition-colors">
                      <span className="text-muted-foreground">Modifications</span>
                      <span className="font-semibold capitalize">{bike.modifications || "None"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Remarks */}
            {bike.description && (
              <div>
                <h3 className="font-bold text-lg mb-3">Seller remark</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed bg-muted/10 p-5 rounded-xl border border-border/50">
                  {bike.description}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
             <div className="sticky top-24 space-y-6">
                {/* Safety Tips */}
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-5 border border-orange-100 dark:border-orange-900/50">
                  <div className="flex gap-3">
                    <Shield className="h-5 w-5 text-orange-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-orange-900 dark:text-orange-400 mb-1">Safety First</h4>
                      <p className="text-xs text-orange-800 dark:text-orange-300/80 leading-relaxed">
                        Never send money before inspecting the bike and verifying its registration documents in person.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button variant="link" className="text-xs text-muted-foreground hover:text-red-500" asChild>
                    <Link href={`/report/${bike.id}`}><Flag className="h-3 w-3 mr-1.5"/> Report this listing</Link>
                  </Button>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Similar Alternatives */}
      {similarBikes.length > 0 && (
        <section className="w-full px-4 md:px-8 py-8 mt-4 bg-muted/10 border-t border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">You might also like</h2>
            <Button variant="link" className="text-primary h-auto p-0" asChild>
              <Link href="/used-bikes">View All</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {similarBikes.map((b) => (
              <Link
                key={b.id}
                href={`/used-bike/${b.slug || b.id}`}
                className="group bg-card rounded-xl border p-3 hover:border-border hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-muted mb-3">
                  <Image
                    src={b.thumbnailUrl || "/placeholder-bike.png"}
                    alt={b.bikeName}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                </div>
                <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                  {b.bikeName}
                </h3>
                <div className="text-lg font-bold text-primary mt-1 mb-2">
                  ৳{(b.price ?? 0).toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {b.location.city}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="w-full px-4 md:px-8 py-3 bg-muted/50 border-b">
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="w-full px-4 md:px-8 py-6 md:py-10">
        <Skeleton className="h-10 w-3/4 max-w-md mb-6" />
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-xl" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
