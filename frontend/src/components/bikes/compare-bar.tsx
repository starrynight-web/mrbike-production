"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCompareStore } from "@/store";

export function CompareBar() {
  const { bikes, removeBike, clearAll, maxBikes } = useCompareStore();
  const [isExpanded, setIsExpanded] = useState(true);

  if (bikes.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 lg:bottom-4 left-4 right-4 z-50 pointer-events-none flex justify-center"
      >
        <div className="bg-card border shadow-xl rounded-xl overflow-hidden pointer-events-auto w-full max-w-4xl">
          {/* Header / Toggle Bar */}
          <div
            className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Compare Bikes ({bikes.length}/{maxBikes})
              </span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 flex flex-col md:flex-row items-center gap-4">
                  {/* Selected Bikes */}
                  <div className="flex-1 flex items-center gap-2 overflow-x-auto hide-scrollbar w-full">
                    {bikes.map((bike) => (
                      <div
                        key={bike.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg shrink-0"
                      >
                        <Image
                          src={bike.thumbnailUrl || "/placeholder-bike.webp"}
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
                    {Array.from({ length: maxBikes - bikes.length }).map(
                      (_, i) => (
                        <div
                          key={`empty-${i}`}
                          className="flex items-center justify-center w-24 h-10 border-2 border-dashed rounded-lg text-xs text-muted-foreground shrink-0"
                        >
                          + Add
                        </div>
                      ),
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
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
                        href={`/compare?bikes=${bikes
                          .map((b) => b.slug)
                          .join(",")}`}
                      >
                        Compare
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
