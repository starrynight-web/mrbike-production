"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, AlertCircle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompareStore } from "@/store";
import { ComparisonTable } from "@/components/bikes/comparison-table";

export function CompareClient() {
  const { bikes, removeBike } = useCompareStore();

  if (bikes.length === 0) {
    return (
      <div className="w-full px-4 md:px-8 py-20 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-muted h-24 w-24 rounded-full mx-auto flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">No Bikes Selected</h1>
          <p className="text-muted-foreground">
            Select bikes from the catalogue to compare their specifications
            side-by-side.
          </p>
          <Button asChild size="lg">
            <Link href="/bikes">Browse Bikes</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (bikes.length === 1) {
    return (
      <div className="w-full px-4 md:px-8 py-20 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-muted h-24 w-24 rounded-full mx-auto flex items-center justify-center overflow-hidden relative">
            <Image
              src={bikes[0].thumbnailUrl}
              alt={bikes[0].name}
              fill
              className="object-cover opacity-80"
            />
          </div>
          <h1 className="text-2xl font-bold">Add Another Bike</h1>
          <p className="text-muted-foreground">
            You have selected <strong>{bikes[0].name}</strong>. Add at least one
            more bike to compare.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => removeBike(bikes[0].id)}>
              Clear Selection
            </Button>
            <Button asChild>
              <Link href="/bikes">Find Competitor</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-muted/50 border-b relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <Scale size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-8 relative z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href="/bikes">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Compare <span className="text-primary">Bikes</span>
              </h1>
              <p className="text-muted-foreground">
                Comparing {bikes.length} bikes side-by-side
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 py-8 md:py-12">
        <ComparisonTable bikes={bikes} onRemove={removeBike} />
      </div>
    </div>
  );
}
