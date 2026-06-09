"use client";

import { useMyListings } from "@/hooks/use-user";
import { 
  Bike, 
  Loader2, 
  PlusCircle, 
  MapPin, 
  Clock, 
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api-service";
import { API_ENDPOINTS } from "@/config/constants";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { sanitizeImageUrl } from "@/lib/data-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export default function MyListingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: myListings, isLoading: listingsLoading } = useMyListings();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-600 border-green-200";
      case "pending": return "bg-amber-500/10 text-amber-600 border-amber-200";
      case "rejected": return "bg-rose-500/10 text-rose-600 border-rose-200";
      case "sold": return "bg-blue-500/10 text-blue-600 border-blue-200";
      default: return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(API_ENDPOINTS.USED_BIKE_DELETE(String(id))),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["user", "listings"] });
      const previous = queryClient.getQueryData(["user", "listings"]);
      queryClient.setQueryData<any[]>(["user", "listings"], (old) =>
        (old || []).filter((l: any) => l.id !== id)
      );
      return { previous };
    },
    onError: (err: any, _id, context) => {
      queryClient.setQueryData(["user", "listings"], context?.previous);
      toast.error(err.message || "Failed to delete listing");
    },
    onSuccess: () => toast.success("Listing deleted successfully"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["user", "listings"] }),
  });

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    deleteMutation.mutate(id);
  };

  const boostMutation = useMutation({
    mutationFn: (id: number) => api.post(`/marketplace/listings/${id}/boost/`),
    onSuccess: () => {
      toast.success("Boost request sent! Admin will approve shortly.");
      queryClient.invalidateQueries({ queryKey: ["user", "listings"] });
    },
    onError: (err: any) => toast.error(err.message || "An error occurred"),
  });

  const handleBoost = (id: number) => boostMutation.mutate(id);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Listings</h2>
          <p className="text-muted-foreground">Manage your ads and sales on MrBikeBD.</p>
        </div>
        <Button asChild className="shadow-lg shadow-primary/20 active:scale-95 transition-all">
          <Link href="/sell-bike">
            <PlusCircle className="mr-2 h-4 w-4" /> Post New Ad
          </Link>
        </Button>
      </div>

      {listingsLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-5 p-4 bg-card border rounded-2xl">
              <Skeleton className="h-40 w-full md:w-56 rounded-xl" />
              <div className="flex-1 space-y-3 py-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-10 w-28 rounded-xl" />
                  <Skeleton className="h-10 w-28 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : myListings?.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed rounded-2xl bg-muted/5 space-y-5">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Bike className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">No ads found</h3>
            <p className="text-muted-foreground">
              You haven't posted any bikes for sale yet.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/sell-bike">Start Selling Now</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {myListings?.map((listing) => (
            <div
              key={listing.id}
              className="group flex flex-col md:flex-row gap-5 p-4 bg-card border rounded-2xl hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
            >
              <div className="h-40 w-full md:w-56 rounded-xl overflow-hidden relative shadow-sm">
                {(() => {
                  const imageUrl = sanitizeImageUrl(
                    listing.image_url || 
                    (listing as any).thumbnail_url || 
                    listing.images?.[0]?.url || 
                    listing.images?.[0], 
                    undefined
                  );
                  return imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={listing.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-muted">
                      <Bike className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  );
                })()}
                <Badge
                  className={`absolute top-3 left-3 px-2 py-0.5 rounded-lg border shadow-sm ${getStatusColor(listing.status)}`}
                >
                  {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </Badge>
                {listing.active_boost ? (
                  <Badge className="absolute top-3 right-3 bg-amber-500 text-white border-none shadow-sm animate-pulse">
                    <Zap className="h-3 w-3 mr-1 fill-white" /> Boosted
                  </Badge>
                ) : (listing as any).has_pending_boost && (
                  <Badge className="absolute top-3 right-3 bg-amber-500/20 text-amber-700 border-amber-200 shadow-sm">
                    <Zap className="h-3 w-3 mr-1" /> Pending Boost
                  </Badge>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="space-y-2">
                   <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xl group-hover:text-primary transition-colors line-clamp-1">
                      {listing.title}
                    </h4>
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                         <DropdownMenu>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>More Actions</p>
                              </TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl">
                              <DropdownMenuItem onClick={() => router.push(`/sell-bike?edit=${listing.id}`)} className="cursor-pointer">
                                <Edit2 className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Link href={`/used-bike/${listing.slug}`} className="flex items-center w-full">
                                    <ExternalLink className="mr-2 h-4 w-4" /> View Ad
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(listing.id)}
                                className="text-destructive focus:text-destructive cursor-pointer"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg">
                      <Bike className="h-3.5 w-3.5" />
                      <span>{(listing.mileage || 0).toLocaleString()} km</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{listing.location.full || listing.location.city || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 md:mt-0">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Asking Price</p>
                    <p className="font-black text-2xl text-primary drop-shadow-sm">
                      ৳ {(Number(listing.price) || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                      className="flex-1 sm:flex-none active:scale-95 transition-all"
                      variant="outline"
                      asChild
                    >
                        <Link href={`/used-bike/${listing.slug}`}>View Public Ad</Link>
                    </Button>
                    <Button 
                      className="flex-1 sm:flex-none active:scale-95 transition-all gap-2"
                      variant={listing.active_boost || (listing as any).has_pending_boost ? "outline" : "default"}
                      disabled={listing.active_boost || (listing as any).has_pending_boost}
                      onClick={() => handleBoost(listing.id)}
                    >
                      <Zap className={listing.active_boost ? "h-4 w-4 fill-amber-500 text-amber-500" : "h-4 w-4"} />
                      {listing.active_boost ? "Boosted" : (listing as any).has_pending_boost ? "Pending" : "Boost Ad"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
