"use client";

import Link from "next/link";
import { useWishlistStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bike, Heart, Star, X } from "lucide-react";

export function FavoritesTab() {
  const { favoriteIds, removeFromFavorites } = useWishlistStore();
  const ids = Array.from(favoriteIds);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Favorite New Bikes ({favoriteIds.size})
        </h3>
      </div>

      {favoriteIds.size === 0 ? (
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
          {ids.map((id) => (
            <Card
              key={id}
              className="overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <Bike className="h-8 w-8 opacity-20" />
                </div>
                <div className="absolute top-2 right-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromFavorites(id);
                    }}
                    aria-label="Remove from favorites"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="mb-2">
                  <h4 className="font-semibold line-clamp-1">
                    {id.replace(/-/g, " ")}
                  </h4>
                  <p className="text-muted-foreground text-xs">Saved bike</p>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-medium">—</span>
                </div>

                <div className="flex gap-2">
                  <Button asChild variant="default" size="sm" className="flex-1">
                    <Link href={`/bike/${id}`}>View bike</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromFavorites(id)}
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
