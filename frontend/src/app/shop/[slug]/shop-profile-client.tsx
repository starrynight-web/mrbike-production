"use client";

import { useState, useEffect } from "react";
import { 
  Store, 
  MapPin, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Loader2, 
  Bike, 
  Calendar, 
  Gauge,
  ExternalLink,
  Info,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api-service";
import { UsedBikeCard } from "@/components/used-bikes/used-bike-card";
import { formatPrice } from "@/lib/utils";
import type { Shop, UsedBike } from "@/types";
import { motion } from "framer-motion";

interface ShopProfileClientProps {
  slug: string;
}

export default function ShopProfileClient({ slug }: ShopProfileClientProps) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [listings, setListings] = useState<UsedBike[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShopData() {
      setIsLoading(true);
      try {
        const shopRes = await api.getShopDetail(slug);
        if (shopRes.success) {
          setShop(shopRes.data);
          
          // Fetch listings for this shop
          const listingsRes = await api.getUsedBikes({ shop: shopRes.data.id });
          if (listingsRes.success) {
            setListings(listingsRes.data as any[]);
          }
        } else {
          setError(shopRes.error?.message || "Shop not found");
        }
      } catch (err) {
        setError("Failed to load shop data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchShopData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="text-zinc-500 font-medium animate-pulse">Loading Shop Profile...</p>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-full mb-6">
          <Info className="h-12 w-12 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Shop Not Found</h2>
        <p className="text-zinc-500 max-w-md mb-8">{error || "The shop you are looking for doesn't exist or has been moved."}</p>
        <Button asChild className="rounded-xl px-8 bg-zinc-900 dark:bg-zinc-50">
          <a href="/marketplace">Back to Marketplace</a>
        </Button>
      </div>
    );
  }

  // Check if map_location is an iframe and extract the src
  let mapSrc = shop.map_location;
  if (mapSrc && mapSrc.includes('<iframe') && mapSrc.includes('src="')) {
    const match = mapSrc.match(/src="([^"]+)"/);
    if (match) {
      mapSrc = match[1];
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 pb-20">
      {/* Premium Header with Cover & Logo */}
      <div className="relative">
        <div className="h-[180px] md:h-[260px] w-full relative overflow-hidden bg-zinc-200 dark:bg-zinc-800">
           {shop.cover_image ? (
             <img src={shop.cover_image} alt={shop.name} className="w-full h-full object-cover" />
           ) : (
             <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-20" />
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-end md:items-center gap-4 md:gap-6 -mt-12 md:-mt-16 group">
            <div className="relative">
               <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 md:border-8 border-white dark:border-zinc-950 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                 <AvatarImage src={shop.logo} />
                 <AvatarFallback className="bg-zinc-100 text-zinc-400">
                   <Store className="h-12 w-12 md:h-16 md:w-16" />
                 </AvatarFallback>
               </Avatar>
               {shop.is_verified && (
                 <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-white dark:bg-zinc-900 p-1 md:p-1.5 rounded-full shadow-lg border-2 border-white dark:border-zinc-950">
                   <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-blue-500 fill-blue-50" />
                 </div>
               )}
            </div>

            <div className="flex-1 pb-2 text-center md:text-left mt-2 md:mt-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white drop-shadow-lg">
                  {shop.name}
                </h1>
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none rounded-full px-3 py-0.5 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                  Authorized Dealer
                </Badge>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-zinc-200/90 text-xs md:text-sm font-medium">
                <div className="flex items-center gap-1.5 drop-shadow-md">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  {shop.location_area && `${shop.location_area}, `}{shop.location_city}
                </div>
                <div className="flex items-center gap-1.5 drop-shadow-md">
                  <Phone className="h-3.5 w-3.5 text-green-400" />
                  {shop.contact_number}
                </div>
              </div>
            </div>

            <div className="pb-2 hidden md:flex items-center gap-3">
               <Button className="bg-white hover:bg-zinc-100 text-zinc-900 font-bold rounded-2xl px-5 shadow-xl py-5 text-sm" size="default">
                 <Phone className="mr-2 h-4 w-4" /> Call Now
               </Button>
               {shop.whatsapp_number && (
                 <Button variant="outline" className="bg-green-500 hover:bg-green-600 text-white border-none rounded-2xl p-3 shadow-xl" size="icon">
                   <MessageSquare className="h-5 w-5" />
                 </Button>
               )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white dark:bg-zinc-900 p-8 space-y-8">
             <div className="space-y-4">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <Info className="h-5 w-5 text-orange-500" />
                 About the Shop
               </h3>
               <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed whitespace-pre-wrap">
                 {shop.description || "No description provided."}
               </p>
             </div>

             <Card className="rounded-3xl border-0 shadow-xl bg-white dark:bg-zinc-900/50 overflow-hidden mb-6">
              <CardContent className="p-0">
                <div className="p-6 pb-4">
                  <div className="flex items-center gap-2 text-orange-500 mb-2">
                    <MapPin className="h-5 w-5" />
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Find Us</h3>
                  </div>
                </div>
                
                <div className="h-[250px] w-full bg-zinc-100 dark:bg-zinc-800 relative">
                  {mapSrc ? (
                    mapSrc.includes('/embed') || mapSrc.includes('google.com/maps/embed') ? (
                      <iframe
                        src={mapSrc}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 p-4 text-center">
                        <MapPin className="h-10 w-10 text-orange-500 mb-3" />
                        <h4 className="font-bold mb-2">Location Available</h4>
                        <p className="text-sm text-zinc-500 mb-4 max-w-xs">Click the button below to view this shop's location on Google Maps.</p>
                        <Button asChild variant="outline" className="rounded-xl border-orange-200 hover:bg-orange-50 text-orange-600 dark:border-orange-900/50 dark:hover:bg-orange-900/20">
                          <a href={mapSrc} target="_blank" rel="noopener noreferrer">
                            Open in Google Maps <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <MapPin className="h-8 w-8 opacity-50" />
                    </div>
                  )}
                </div>
                
                <div className="p-6 bg-zinc-50 dark:bg-zinc-900">
                   <p className="text-sm text-zinc-500 font-medium">Full Address:</p>
                   <p className="text-zinc-900 dark:text-zinc-100 font-semibold mt-1 leading-snug">{shop.location_full}</p>
                </div>
              </CardContent>
             </Card>

             <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between text-sm">
                   <span className="text-zinc-500">Business Since</span>
                   <span className="font-bold">{new Date(shop.created_at).getFullYear()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                   <span className="text-zinc-500">Listings Active</span>
                   <span className="font-bold text-orange-500">{listings.length}</span>
                </div>
             </div>
          </Card>

          <Button className="w-full h-16 rounded-3xl bg-orange-500 hover:bg-orange-600 text-white font-black text-lg shadow-2xl shadow-orange-500/20 uppercase tracking-widest gap-2">
             <Share2 className="h-5 w-5" /> Share Shop
          </Button>
        </div>

        {/* Listings Content */}
        <div className="lg:col-span-8 space-y-6">
           <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Bike className="h-6 w-6 text-orange-500" />
                  Available Inventory
                </h2>
                <p className="text-zinc-500 text-sm font-medium">Showing {listings.length} premium listings from this seller</p>
              </div>
           </div>

           {listings.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {listings.map((bike, index) => (
                 <motion.div
                    key={bike.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                 >
                    <UsedBikeCard bike={bike} />
                 </motion.div>
               ))}
             </div>
           ) : (
             <Card className="rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-20 text-center bg-transparent">
                <div className="max-w-xs mx-auto space-y-4">
                   <div className="bg-zinc-100 dark:bg-zinc-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                      <Bike className="h-10 w-10 text-zinc-300" />
                   </div>
                   <h3 className="text-xl font-bold">No active listings</h3>
                   <p className="text-zinc-500">This shop hasn't posted any bikes for sale yet. Check back soon!</p>
                </div>
             </Card>
           )}
        </div>
      </div>
    </div>
  );
}
