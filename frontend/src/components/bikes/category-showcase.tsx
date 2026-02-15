"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Wind,
  Building2,
  CircleDot,
  Compass,
  Mountain,
  Plug,
  Bike as BikeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const getIcon = (categoryValue: string) => {
    return (
      {
        sport: Zap,
        naked: Wind,
        commuter: Building2,
        scooter: CircleDot,
        cruiser: Compass,
        adventure: Mountain,
        electric: Plug,
      }[categoryValue] || BikeIcon
    );
  };

  return (
    <div className="w-full">
      {/* Header with Arrows for Desktop */}
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <div className="text-center md:text-left w-full md:w-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Browse by Category
          </h2>
          <p className="text-muted-foreground">
            Explore bikes by riding style and purpose
          </p>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-2">
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
            const Icon = getIcon(category.value);
            return (
              <Link
                key={category.value}
                href={`/bikes?category=${category.value}`}
              >
                <div className="group rounded-2xl p-4 bg-background border hover:border-primary/20 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-6 w-6" />
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
            const Icon = getIcon(category.value);
            return (
              <Link
                key={category.value}
                href={`/bikes?category=${category.value}`}
                className="shrink-0"
              >
                <div className="group w-40 h-44 rounded-2xl p-6 bg-background border hover:border-primary/20 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center text-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-7 w-7" />
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
