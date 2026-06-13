"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bike, Heart, Loader2, Star, X } from "lucide-react";
import { api } from "@/lib/api-service";
import { formatPrice } from "@/lib/utils";

export function FavoritesTab() {
  const { favoriteIds, removeFromFavorites } = useWishlistStore();
  const ids = Array.from(favoriteIds);
  
  const [favoriteBikes, setFavoriteBikes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      if (ids.length === 0) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const promises = ids.map(slug => api.getBikeBySlug(slug));
        const results = await Promise.all(promises);
        
        const validBikes = results
          .filter(res => res.success && res.data)
          .map(res => res.data!);
          
        setFavoriteBikes(validBikes);
        
        // Remove slugs/ids that returned 404 (deleted bikes)
        const validIdentifiers = new Set(validBikes.flatMap(b => [b.slug, String(b.id)]));
        ids.forEach(id => {
          if (!validIdentifiers.has(id)) {
            useWishlistStore.getState().removeFromFavorites(id);
          }
        });
      } catch (err) {
        console.error("Failed to load favorites:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    // Only run this when the component mounts to prevent infinite loops if store changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadFavorites();
  }, []);

  // Filter out any bikes the user just removed locally without refreshing
  const displayBikes = favoriteBikes.filter(bike => favoriteIds.has(bike.slug) || favoriteIds.has(String(bike.id)));

  if (isLoading && favoriteIds.size > 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-4" />
        <p className="text-zinc-500">Loading your favorite bikes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Favorite New Bikes ({displayBikes.length})
        </h3>
      </div>

      {displayBikes.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 rounded-lg border-dashed border-2 flex flex-col items-center">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No favorites yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Save new bike models you love to access them quickly.
          </p>
          <Button asChild>
            <Link href="/bikes">Browse New Bikes</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBikes.map((bike) => (
            <Card
              key={bike.id}
              className="overflow-hidden group hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="aspect-video bg-muted relative">
                <Link href={`/bike/${bike.slug}`} className="block w-full h-full">
                  {bike.primary_image || bike.thumbnailUrl ? (
                    <Image
                      src={bike.primary_image || bike.thumbnailUrl}
                      alt={bike.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <Bike className="h-8 w-8 opacity-20" />
                    </div>
                  )}
                </Link>
                <div className="absolute top-2 right-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromFavorites(bike.slug);
                      removeFromFavorites(String(bike.id));
                    }}
                    aria-label="Remove from favorites"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="mb-2">
                  <div className="text-xs text-muted-foreground mb-1">
                    {bike.brand_name || bike.brand?.name}
                  </div>
                  <h4 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    <Link href={`/bike/${bike.slug}`}>{bike.name}</Link>
                  </h4>
                  <p className="font-bold text-sm mt-1">
                    {bike.price ? formatPrice(bike.price) : "Price TBD"}
                  </p>
                </div>

                <div className="mt-auto pt-4 flex gap-2">
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="flex-1"
                  >
                    <Link href={`/bike/${bike.slug}`}>View Details</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      removeFromFavorites(bike.slug);
                      removeFromFavorites(String(bike.id));
                    }}
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
