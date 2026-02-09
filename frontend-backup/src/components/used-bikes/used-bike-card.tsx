import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Gauge, CheckCircle, Flame } from "lucide-react";
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
        <Card className={cn("overflow-hidden group h-full flex flex-col hover:shadow-lg transition-shadow", className)}>
            {/* Image Section */}
            <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                <Link href={`/used-bike/${bike.id}`} className="block h-full w-full relative">
                    <Image
                        src={bike.thumbnailUrl}
                        alt={bike.bikeName}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </Link>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {bike.isVerified && (
                        <Badge variant="secondary" className="bg-green-500/90 text-white hover:bg-green-500 gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                        </Badge>
                    )}
                    {bike.isFeatured && (
                        <Badge variant="secondary" className="bg-amber-500/90 text-white hover:bg-amber-500 gap-1">
                            <Flame className="h-3 w-3" />
                            Featured
                        </Badge>
                    )}
                </div>

                <Badge variant="outline" className="absolute bottom-2 right-2 bg-black/60 text-white border-none backdrop-blur-sm z-10">
                    {formatRelativeTime(bike.createdAt)}
                </Badge>
            </div>

            {/* Content */}
            <CardContent className="p-4 flex-1">
                <div className="text-xs text-muted-foreground mb-1">{bike.brandName}</div>
                <Link href={`/used-bike/${bike.id}`} className="block">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
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

                <div className="text-xl font-bold text-primary">
                    {formatPrice(bike.price)}
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button asChild variant="outline" className="w-full">
                    <Link href={`/used-bike/${bike.id}`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
