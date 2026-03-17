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
  User,
  Sparkles,
  FileText,
  Shield,
  CheckCircle2,
  Star,
  Bike
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

// Custom premium font loader (mocked via CSS classes here)
// Assuming Inter and Outfit are available in the project

interface UsedBikeDetailClientProps {
  slug: string;
  initialData?: UsedBike;
}

export function UsedBikeDetailClient({ slug, initialData }: UsedBikeDetailClientProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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

  if (isLoading) return <DetailSkeleton />;

  if (error || !bike) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Listing Unavailable</h1>
        <p className="text-muted-foreground mb-8">
          This listing may have been sold or removed by the seller.
        </p>
        <Button asChild className="rounded-full px-8">
          <Link href="/used-bikes">Explore Other Bikes</Link>
        </Button>
      </div>
    );
  }

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
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

  const contactPhone = bike.primaryContactNumber || bike.sellerPhone;
  const whatsappPhone = bike.whatsappNumber || contactPhone;

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#09090B] pb-24">
      {/* Dynamic Header */}
      <div className="sticky top-0 z-40 w-full border-b bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl transition-all duration-500">
        <div className="container max-w-7xl h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/used-bikes"
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all duration-300 active:scale-95 group"
            >
              <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-tight truncate max-w-[200px] lg:max-w-md text-zinc-900 dark:text-zinc-100">
                {bike.bikeName}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                  {bike.year} • {bike.location.city}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-primary/5 hover:text-primary transition-all h-9 w-9"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "rounded-xl border-zinc-200 dark:border-zinc-800 transition-all h-9 w-9",
                isWishlisted
                  ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20"
                  : "hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100"
              )}
              onClick={() => toggleWishlist(bike.id)}
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* LEFT COLUMN: Visuals & Core Info */}
          <div className="space-y-12">
            {/* Gallery Section */}
            <div className="space-y-4">
              <div className="relative group bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-500">
                <div className="aspect-[16/9] relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={bike.images[activeImageIndex] || bike.thumbnailUrl}
                        alt={bike.bikeName}
                        fill
                        className="object-contain p-4 md:p-8"
                        priority
                        unoptimized
                        crossOrigin="anonymous"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Badges Overlay */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                    {bike.isVerified && (
                      <Badge className="bg-blue-600 text-white border-none px-3 py-1 rounded-lg shadow-lg flex gap-2 w-fit">
                        <ShieldCheck className="h-3.5 w-3.5" /> <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
                      </Badge>
                    )}
                  </div>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-zinc-900/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg">
                    {activeImageIndex + 1} / {bike.images.length || 1}
                  </div>
                </div>

                {/* Overlaid Controls */}
                {bike.images.length > 1 && (
                  <>
                    <div className="absolute inset-y-0 left-2 flex items-center">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all h-10 w-10 bg-white/80 dark:bg-zinc-800/80 border-none backdrop-blur-md"
                        onClick={() => setActiveImageIndex(i => (i === 0 ? bike.images.length - 1 : i - 1))}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="absolute inset-y-0 right-2 flex items-center">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all h-10 w-10 bg-white/80 dark:bg-zinc-800/80 border-none backdrop-blur-md"
                        onClick={() => setActiveImageIndex(i => (i === bike.images.length - 1 ? 0 : i + 1))}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Compact Thumbnails */}
              {bike.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {bike.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={cn(
                        "relative flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all duration-300",
                        activeImageIndex === idx
                          ? "border-primary shadow-sm scale-105"
                          : "border-zinc-100 dark:border-zinc-800 grayscale hover:grayscale-0"
                      )}
                    >
                      <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" unoptimized />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Core Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Year", value: bike.year, icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Mileage", value: `${(bike.kmDriven ?? 0).toLocaleString()} km`, icon: Gauge, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: "Condition", value: bike.condition, icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10" },
                { label: "Engine", value: bike.engineCC ? `${bike.engineCC} CC` : "N/A", icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10" },
              ].map((spec, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 px-4 py-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", spec.bg)}>
                    <spec.icon className={cn("h-5 w-5", spec.color)} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{spec.label}</p>
                    <p className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 capitalize">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats Grid - Larger Boxes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Year", value: bike.year, icon: Calendar },
                { label: "Mileage", value: `${(bike.kmDriven ?? 0).toLocaleString()} km`, icon: Gauge },
                { label: "Engine", value: `${(bike.engineCC ?? 0)} cc`, icon: Zap },
                { label: "Location", value: bike.location.city, icon: MapPin },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center space-y-2">
                  <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-1">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Comprehensive Specifications (Technical Specs) */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-10">
              <div className="flex items-center gap-4">
                <div className="h-10 w-2 bg-primary rounded-full" />
                <h2 className="text-2xl font-black tracking-tight">Technical Specifications</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 px-1">Registration & Papers</h3>
                  <div className="space-y-5">
                    {[
                      { label: "Registration Year", value: bike.registrationYear || bike.year, icon: FileText },
                      { label: "Registration Type", value: bike.registrationType || "Not Specified", icon: Shield },
                      { label: "Original Papers", value: bike.hasOriginalPapers ? "Available" : "Not Available", icon: CheckCircle2, color: bike.hasOriginalPapers ? "text-emerald-500" : "text-rose-500" },
                      { label: "Ownership", value: `${bike.ownershipCount || 1}${bike.ownershipCount === 1 ? 'st' : bike.ownershipCount === 2 ? 'nd' : bike.ownershipCount === 3 ? 'rd' : 'th'} Owner`, icon: User },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/50">
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 text-zinc-400" />
                          <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                        </div>
                        <span className={cn("text-sm font-bold text-zinc-900 dark:text-zinc-100", item.color)}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 px-1">Bike Condition</h3>
                  <div className="space-y-5">
                    {[
                      { label: "Engine Condition", value: bike.engineCondition || "Good", icon: Zap },
                      { label: "Body Condition", value: bike.bodyCondition || "Good", icon: Bike },
                      { label: "Modifications", value: bike.modifications || "None", icon: Star },
                      { label: "Added On", value: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(bike.createdAt)), icon: Calendar },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/50">
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 text-zinc-400" />
                          <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                        </div>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {bike.description && (
                <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 px-1">Seller Remark</h3>
                  <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {bike.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Price, Actions & Safety */}
          <aside className="space-y-8 lg:sticky lg:top-24">
            {/* Price & Seller Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 border border-zinc-100 dark:border-zinc-800 shadow-lg space-y-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Asking Price</p>
                <div className="flex items-center justify-between">
                  <h3 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                    ৳{(bike.price ?? 0).toLocaleString()}
                  </h3>
                  {bike.isUrgent && (
                    <Badge className="bg-rose-500 text-white border-none px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      Urgent
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 space-y-8">
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-700">
                    <User className="h-8 w-8 text-zinc-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Seller</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{bike.sellerName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                      <MapPin className="h-3.5 w-3.5" /> {bike.location.city}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Button
                    size="lg"
                    className="w-full h-16 rounded-2xl bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 text-white font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-zinc-900/10"
                    onClick={() => window.open(`tel:${contactPhone}`)}
                  >
                    <Phone className="mr-3 h-5 w-5" /> Call Seller
                  </Button>
                  
                  {whatsappPhone && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full h-16 rounded-2xl border-emerald-100 bg-emerald-50/50 text-emerald-600 font-bold text-lg hover:bg-emerald-50 transition-all"
                      onClick={() => handleWhatsApp(whatsappPhone, bike.bikeName)}
                    >
                      <MessageCircle className="mr-3 h-5 w-5" /> WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Safety Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-3xl p-8 border border-amber-100 dark:border-amber-900/30 flex items-start gap-4">
              <ShieldCheck className="h-7 w-7 text-amber-600 shrink-0" />
              <div>
                <h4 className="font-bold text-base text-amber-900 dark:text-amber-500 mb-1">Safety First</h4>
                <p className="text-sm text-amber-800/80 dark:text-amber-400/80 leading-relaxed font-medium">
                  Always inspect the bike in person and verify all registration papers at BRTA before payment.
                </p>
              </div>
            </div>

            <Button
              variant="link"
              className="w-full text-zinc-400 hover:text-rose-500 text-sm font-bold opacity-60 hover:opacity-100 transition-all"
              asChild
            >
              <Link href={`/report/${bike.id}`}>
                <Flag className="h-4 w-4 mr-2" /> Report Listing
              </Link>
            </Button>
          </aside>
        </div>

        {/* Similar Ads Section */}
        {similarBikes.length > 0 && (
          <div className="mt-24 pt-24 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black tracking-tight">Similar Listings</h2>
              <Button asChild variant="ghost" className="text-sm font-bold text-primary hover:bg-primary/5">
                <Link href="/used-bikes">View All <ChevronRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {similarBikes.map((b) => (
                <Link
                  key={b.id}
                  href={`/used-bike/${b.slug || b.id}`}
                  className="group bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-100 dark:border-zinc-800 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                >
                  <div className="aspect-[4/3] relative bg-zinc-50 dark:bg-zinc-800">
                    <Image
                      src={b.thumbnailUrl}
                      alt={b.bikeName}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-base truncate mb-1 text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors">
                      {b.bikeName}
                    </h3>
                    <div className="text-xl font-black text-primary mb-4">
                      ৳{(b.price ?? 0).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400" /> {b.location.city}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
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
