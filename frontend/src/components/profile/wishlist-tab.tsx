"use client";

import Link from "next/link";
import { useWishlistStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bike, Heart } from "lucide-react";

export function WishlistTab() {
  const { bikeIds } = useWishlistStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Saved Used Bikes ({bikeIds.size})
        </h3>
      </div>

      {bikeIds.size === 0 ? (
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
          {/* Placeholder for Wishlist items - in real app would fetch by IDs */}
          {[...Array(bikeIds.size > 0 ? Math.min(bikeIds.size, 6) : 0)].map(
            (_, i) => (
              <Card
                key={i}
                className="overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <Bike className="h-8 w-8 opacity-20" />
                  </div>
                  {/* Mock Image Placeholder */}
                  <div className="absolute top-2 right-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 bg-white/80 hover:bg-white"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold line-clamp-1">
                      Used Bike Listing {i + 1}
                    </h4>
                    <span className="font-bold text-sm">৳ 1,50,000</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                    2023 Model • 5,000 km • Dhaka
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}
