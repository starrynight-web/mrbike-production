"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store";

export function HeroSearch() {
  const { setSearchOpen } = useUIStore();

  return (
    <div className="relative max-w-xl mx-auto mb-8 flex items-center gap-2">
      <div className="relative flex-1 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full h-14 pl-12 pr-24 text-lg text-left text-muted-foreground rounded-full border-2 bg-background/80 backdrop-blur-sm hover:border-primary hover:bg-background/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Search bikes or brands...
        </button>
        <Button
          onClick={() => setSearchOpen(true)}
          size="lg"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6"
        >
          Search
        </Button>
      </div>
    </div>
  );
}
