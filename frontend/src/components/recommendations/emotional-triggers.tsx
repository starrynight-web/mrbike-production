"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Bike, MapPin, Gauge } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useEmotionalRecommendations } from "@/hooks/use-recommendations";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface EmotionalTriggersProps {
  slug: string;
  bikeName: string;
}

export function EmotionalTriggers({ slug, bikeName }: EmotionalTriggersProps) {
  const { data: recommendations, isLoading, error } = useEmotionalRecommendations(slug);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-8 border-t">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-primary font-bold tracking-tight uppercase text-sm">
              Emotional Trigger
            </span>
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            For the same price as the {bikeName}, you could own these premium legends:
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((listing, index) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-card border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300"
          >
            <Link href={`/used-bike/${listing.slug}`} className="block">
              {/* Image Container */}
              <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                <Image
                  src={listing.thumbnailUrl || "/placeholder-bike.png"}
                  alt={listing.bikeName}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Condition Badge */}
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase py-0.5">
                    {listing.condition}
                  </Badge>
                </div>

                {/* Price Overaly */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                   <div className="text-white font-bold text-lg">
                    {formatPrice(listing.price)}
                   </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-sm truncate mb-2 group-hover:text-primary transition-colors">
                  {listing.bikeName}
                </h3>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Gauge className="h-3 w-3" />
                    <span>{listing.kmDriven || "N/A"} km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{listing.location?.city || "BD"}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between">
                   <span className="text-[10px] font-bold text-primary uppercase flex items-center gap-1">
                     <Sparkles className="h-3 w-3" />
                     Premium Match
                   </span>
                   <span className="text-[10px] text-muted-foreground">
                     {listing.year}
                   </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
