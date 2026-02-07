"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCompareStore } from "@/store";

export function CompareBar() {
  const { bikes, removeBike, clearAll, maxBikes } = useCompareStore();

  if (bikes.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 lg:bottom-4 left-4 right-4 z-40"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border shadow-lg rounded-xl p-4">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <LayoutGrid className="h-5 w-5" />
              </div>

              {/* Selected Bikes */}
              <div className="flex-1 flex items-center gap-2 overflow-x-auto hide-scrollbar">
                {bikes.map((bike) => (
                  <div
                    key={bike.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg shrink-0"
                  >
                    <Image
                      src={bike.thumbnailUrl}
                      alt={bike.name}
                      width={32}
                      height={24}
                      className="rounded object-cover"
                    />
                    <span className="text-sm font-medium truncate max-w-24">
                      {bike.name}
                    </span>
                    <button
                      onClick={() => removeBike(bike.id)}
                      className="p-0.5 hover:bg-destructive/10 rounded"
                      aria-label={`Remove ${bike.name}`}
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: maxBikes - bikes.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex items-center justify-center w-24 h-10 border-2 border-dashed rounded-lg text-xs text-muted-foreground shrink-0"
                  >
                    + Add
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-muted-foreground"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  disabled={bikes.length < 2}
                  asChild
                  className={cn(bikes.length < 2 && "opacity-50")}
                >
                  <Link
                    href={`/compare?bikes=${bikes.map((b) => b.slug).join(",")}`}
                  >
                    Compare
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Hint text */}
            {bikes.length === 1 && (
              <p className="text-xs text-muted-foreground mt-2 text-center sm:text-left">
                Add {maxBikes - bikes.length} more bike
                {maxBikes - bikes.length > 1 ? "s" : ""} to compare
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
