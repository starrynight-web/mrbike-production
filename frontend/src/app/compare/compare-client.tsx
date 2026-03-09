"use client";

import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompareStore } from "@/store";
import { ComparisonTable } from "@/components/bikes/comparison-table";
import { CompareYourChoiceSection } from "@/components/bikes/compare-your-choice-section";

export function CompareClient() {
  const { bikes, removeBike } = useCompareStore();

  return (
    <div className="min-h-screen">
      {/* Header */}
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
                {bikes.length === 0
                  ? "Search and add bikes below to compare"
                  : `Comparing ${bikes.length} bike${bikes.length > 1 ? "s" : ""} side-by-side`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Compare Your Choice (search + slots) — always visible */}
      <div className="w-full px-4 md:px-8">
        <CompareYourChoiceSection hideCompareCta />
      </div>

      {/* Comparison Table or placeholder */}
      {bikes.length >= 2 ? (
        <div className="w-full px-4 md:px-8 py-8 md:py-12 border-t">
          <ComparisonTable bikes={bikes} onRemove={removeBike} />
        </div>
      ) : (
        <div className="w-full px-4 md:px-8 py-12 border-t">
          <p className="text-center text-muted-foreground text-sm">
            {bikes.length === 0
              ? "Add at least 2 bikes using the search above to start comparing."
              : "Add one more bike to start the side-by-side comparison."}
          </p>
        </div>
      )}
    </div>
  );
}
