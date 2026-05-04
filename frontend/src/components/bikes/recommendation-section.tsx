"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Bike as BikeIcon, TrendingUp, ShieldCheck, BadgeDollarSign, Compass, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-service";
import { mapBike } from "@/lib/data-utils";
import type { Bike } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface RecommendationSectionProps {
  slug: string;
  className?: string;
}

export function RecommendationSection({ slug, className }: RecommendationSectionProps) {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["recommendations", "v2", slug],
    queryFn: async () => {
      const response = await api.get(`recommendations/v2/bike/${slug}/`);
      if (!response.success) throw new Error("Failed to fetch recommendations");
      
      const data = response.data as Record<string, any>;
      const result: Record<string, Bike | null> = {};
      
      for (const [slot, bikeData] of Object.entries(data)) {
        result[slot] = bikeData ? mapBike(bikeData) : null;
      }
      
      return result;
    },
    staleTime: 30 * 60 * 1000,
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!recommendations) return null;

  const slots = [
    { 
      key: "slot_1", 
      title: "Direct Alternative", 
      description: "Better trust & reliability", 
      icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    { 
      key: "slot_2", 
      title: "Best Value", 
      description: "More bike for less money", 
      icon: <BadgeDollarSign className="w-4 h-4 text-amber-500" />,
      color: "bg-amber-500/10 text-amber-600",
    },
    { 
      key: "slot_3", 
      title: "Step Up", 
      description: "Aspirational upgrade path", 
      icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
      color: "bg-blue-500/10 text-blue-600",
    },
    { 
      key: "slot_4", 
      title: "Why Not Try?", 
      description: "Something different for you", 
      icon: <Compass className="w-4 h-4 text-purple-500" />,
      color: "bg-purple-500/10 text-purple-600",
    },
  ];

  const validSlots = slots.filter(s => recommendations[s.key]);

  if (validSlots.length === 0) return null;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Smart Alternatives</h2>
          <p className="text-muted-foreground">Personalized picks based on market data & trust scores</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {validSlots.map((slot) => {
          const bike = recommendations[slot.key]!;
          return (
            <Link 
              key={slot.key} 
              href={`/bike/${bike.slug}`}
              className="group relative flex flex-col bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              {/* Badge/Trigger */}
              <div className={cn("absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md", slot.color)}>
                {slot.icon}
                {slot.title}
              </div>

              {/* Image */}
              <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                <Image
                  src={bike.primary_image || "/placeholder-bike.png"}
                  alt={bike.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{bike.brand_name}</p>
                  <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                    {bike.name}
                  </h3>
                </div>

                <div className="mt-auto pt-3 border-t flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">From</span>
                    <span className="text-lg font-black text-primary leading-none">
                      {formatPrice(bike.price || 0)}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
              
              {/* Tooltip-like description on hover */}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-primary text-primary-foreground text-[10px] font-medium translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-center uppercase tracking-widest">
                {slot.description}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
