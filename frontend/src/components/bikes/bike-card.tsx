"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Fuel, Star, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { useWishlistStore, useCompareStore, useHasHydrated } from "@/store";
import type { Bike } from "@/types";

interface BikeCardProps {
  bike: Bike;
  showCompare?: boolean;
  priority?: boolean;
}

export function BikeCard({
  bike,
  showCompare = true,
  priority = false,
}: BikeCardProps) {
  const { isInFavorites, toggleFavorite } = useWishlistStore();
  const { isBikeSelected, addBike, removeBike } = useCompareStore();
  const wishlistHydrated = useHasHydrated(useWishlistStore);
  const compareHydrated = useHasHydrated(useCompareStore);
  const storesReady = wishlistHydrated && compareHydrated;

  const bikeId = String(bike.id);
  const isFavorited = isInFavorites(bikeId);
  const isSelected = isBikeSelected(bikeId);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!storesReady) return;
    toggleFavorite(bikeId);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!storesReady) return;
    if (isSelected) {
      removeBike(bikeId);
    } else {
      addBike(bike);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/bike/${bike.slug}`}>
        <Card className="group h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          {/* Image Container */}
          <div className="aspect-[4/3] relative overflow-hidden bg-muted">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10" />

            {/* Image */}
            <Image
              src={bike.thumbnailUrl || "/placeholder-bike.webp"}
              alt={bike.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
            />

            {/* Category Badge */}
            <Badge className="absolute top-3 left-3 z-20 capitalize">
              {bike.category}
            </Badge>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={handleFavoriteClick}
              disabled={!storesReady}
              className={cn(
                "absolute top-3 right-3 z-20 p-2 rounded-full transition-all duration-200",
                isFavorited
                  ? "bg-red-500 text-white"
                  : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500",
              )}
              aria-label={
                isFavorited ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
            </button>

            {/* Compare Checkbox */}
            {showCompare && (
              <button
                type="button"
                onClick={handleCompareClick}
                disabled={!storesReady}
                className={cn(
                  "absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/80 text-gray-700 hover:bg-white",
                )}
                aria-label={
                  isSelected ? "Remove from compare" : "Add to compare"
                }
              >
                <Check className={cn("h-3 w-3", !isSelected && "opacity-0")} />
                Compare
              </button>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-4">
            {/* Brand */}
            <p className="text-xs text-muted-foreground mb-1">
              {bike.brand.name}
            </p>

            {/* Name */}
            <h3 className="font-semibold line-clamp-1 mb-2 group-hover:text-primary transition-colors">
              {bike.name}
            </h3>

            {/* Price */}
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-primary">
                {bike.priceRange
                  ? formatPrice(bike.priceRange.min)
                  : bike.price
                  ? formatPrice(bike.price)
                  : "Price TBD"}
              </span>
              {bike.priceRange &&
                bike.priceRange.min !== bike.priceRange.max && (
                  <span className="text-xs text-muted-foreground">
                    - {formatPrice(bike.priceRange.max)}
                  </span>
                )}
            </div>

            {/* Specs */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Fuel className="h-4 w-4" />
                <span>{bike.specs?.mileage || bike.mileage || "N/A"} kmpl</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{bike.rating?.average?.toFixed(1) || "0.0"}</span>
                <span className="text-xs">({bike.rating?.count || 0})</span>
              </div>
            </div>

            {/* Additional Specs Row */}
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span>{bike.specs?.displacement || "N/A"}cc</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span>{bike.specs?.topSpeed || "N/A"} kmph</span>
              {bike.isElectric && (
                <>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                  <Badge variant="outline" className="px-1 py-0 text-[10px]">
                    Electric
                  </Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
