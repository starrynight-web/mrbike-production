"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlistStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Bike, Heart, Loader2 } from "lucide-react";
import { api } from "@/lib/api-service";
import { UsedBikeCard } from "@/components/used-bikes/used-bike-card";

export function WishlistTab() {
  const { bikeIds, removeFromWishlist } = useWishlistStore();
  const ids = Array.from(bikeIds);

  const [wishlistBikes, setWishlistBikes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      if (ids.length === 0) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const promises = ids.map(id => api.getUsedBike(id));
        const results = await Promise.all(promises);
        
        const validBikes = results
          .filter(res => res.success && res.data)
          .map(res => res.data!);
          
        setWishlistBikes(validBikes);
        
        // Remove IDs that returned 404 (deleted or removed by admin/seller)
        const validIdsSet = new Set(validBikes.map(b => String(b.id)));
        ids.forEach(id => {
          if (!validIdsSet.has(String(id))) {
            useWishlistStore.getState().removeFromWishlist(id);
          }
        });
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    // Only run this when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadWishlist();
  }, []);

  // Filter out any bikes the user just removed locally without refreshing
  const displayBikes = wishlistBikes.filter((bike) => bikeIds.has(String(bike.id)));

  if (isLoading && bikeIds.size > 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-4" />
        <p className="text-zinc-500">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Saved Used Bikes ({displayBikes.length})
        </h3>
      </div>

      {displayBikes.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 rounded-lg border-dashed border-2 flex flex-col items-center">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Save used bikes you are interested in to compare them later or get
            notified about price drops.
          </p>
          <Button asChild>
            <Link href="/used-bikes">Browse Used Bikes</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBikes.map((bike) => (
            <div key={bike.id} className="relative">
              <UsedBikeCard bike={bike} />
              <div className="absolute top-2 right-2 z-20">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 bg-white/80 hover:bg-white"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Remove from local instantly
                    removeFromWishlist(String(bike.id));
                  }}
                >
                  <Heart className="h-4 w-4 fill-current" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
