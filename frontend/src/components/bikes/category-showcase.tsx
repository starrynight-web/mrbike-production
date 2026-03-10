"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BIKE_CATEGORIES } from "@/config/constants";

export function CategoryShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    // Card width (approx 160px) + gap (24px)
    const step = 200;
    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full">
      {/* Header with Arrows for Desktop */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 md:mb-10">
        <div className="space-y-2">
          <Badge
            variant="outline"
            className="text-primary border-primary/20 bg-primary/5"
          >
            <LayoutGrid className="w-3 h-3 mr-1" />
            Categories
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Browse by <span className="text-primary">Category</span>
          </h2>
          <p className="text-muted-foreground">
            Explore bikes by riding style and purpose.
          </p>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous categories"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Next categories"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative">
        {/* Mobile View: Grid */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {BIKE_CATEGORIES.map((category) => {
            return (
              <Link
                key={category.value}
                href={`/bikes?category=${category.value}`}
              >
                <div className="group rounded-2xl p-4 bg-background border hover:border-primary/20 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center gap-3">
                  <div className="h-20 w-20 rounded-full bg-muted overflow-hidden relative border-2 border-transparent group-hover:border-primary/20 transition-all">
                    <Image
                      src={category.image}
                      alt={category.label}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{category.label}</p>
                    <span className="text-xs text-muted-foreground">
                      Category
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Desktop View: Carousel */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="hidden md:flex gap-6 overflow-x-auto scroll-smooth pb-4 hide-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {BIKE_CATEGORIES.map((category) => {
            return (
              <Link
                key={category.value}
                href={`/bikes?category=${category.value}`}
                className="shrink-0"
              >
                <div className="group w-40 h-52 rounded-2xl p-6 bg-background border hover:border-primary/20 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center text-center gap-4">
                  <div className="h-24 w-24 rounded-full bg-muted overflow-hidden relative border-2 border-transparent group-hover:border-primary/20 transition-all">
                    <Image
                      src={category.image}
                      alt={category.label}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold">{category.label}</p>
                    <span className="text-xs text-muted-foreground">
                      Category
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
