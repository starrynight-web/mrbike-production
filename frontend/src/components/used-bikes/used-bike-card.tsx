import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Gauge, CheckCircle, Flame, Bike, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice, cn, formatRelativeTime } from "@/lib/utils";
import type { UsedBike } from "@/types";

interface UsedBikeCardProps {
  bike: UsedBike;
  className?: string;
}

export function UsedBikeCard({ bike, className }: UsedBikeCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden group h-full flex flex-col hover:shadow-lg transition-shadow",
        className,
      )}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <Link
          href={`/used-bike/${bike.slug}`}
          className="block h-full w-full relative"
        >
          {bike.thumbnailUrl ? (
            <Image
              src={bike.thumbnailUrl}
              alt={bike.bikeName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Bike className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {bike.isVerified && (
            <Badge
              variant="secondary"
              className="bg-green-500/90 text-white hover:bg-green-500 gap-1"
            >
              <CheckCircle className="h-3 w-3" />
              Verified
            </Badge>
          )}
          {bike.isFeatured && (
            <Badge
              variant="secondary"
              className="bg-amber-500/90 text-white hover:bg-amber-500 gap-1"
            >
              <Flame className="h-3 w-3" />
              Featured
            </Badge>
          )}
        </div>

        <Badge
          variant="outline"
          className="absolute bottom-2 right-2 bg-black/60 text-white border-none backdrop-blur-sm z-10"
        >
          {formatRelativeTime(bike.createdAt)}
        </Badge>
      </div>

      {/* Content */}
      <CardContent className="p-4 flex-1">
        <div className="text-xs text-muted-foreground mb-1">
          {bike.brandName}
        </div>
        <Link href={`/used-bike/${bike.slug}`} className="block">
          <h3 className="font-semibold line-clamp-1 mb-2 group-hover:text-primary transition-colors">
            {bike.bikeName}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {bike.year}
          </div>
          <div className="flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" />
            {bike.kmDriven.toLocaleString()} km
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {bike.location.city}
          </div>
        </div>

        <div className="text-lg font-bold text-primary mb-2">
          {formatPrice(bike.price)}
        </div>

        {/* Shop Info Integration */}
        {bike.shop && (
          <div className="pt-3 border-t flex items-center justify-between">
            <Link 
              href={`/shop/${bike.shop.slug}`} 
              className="flex items-center gap-2 group/shop cursor-pointer"
            >
              <div className="relative w-6 h-6 rounded-full overflow-hidden border border-zinc-100 bg-zinc-50 shrink-0">
                {bike.shop.logo ? (
                  <Image src={bike.shop.logo} alt={bike.shop.name} fill className="object-cover" />
                ) : (
                  <Store className="h-4 w-4 m-1 text-zinc-400" />
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-zinc-900 line-clamp-1 group-hover/shop:text-primary transition-colors uppercase tracking-tight">
                    {bike.shop.name}
                  </span>
                  {bike.shop.is_verified && (
                    <CheckCircle className="h-2.5 w-2.5 text-blue-500 fill-blue-50" />
                  )}
                </div>
                <span className="text-[8px] text-zinc-500 font-medium">Dealer Shop</span>
              </div>
            </Link>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-zinc-200 text-zinc-600 bg-zinc-50/50">
              Visit Shop
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
