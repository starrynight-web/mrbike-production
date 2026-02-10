"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBikes } from "@/hooks/use-bikes";
import { Bike } from "@/types";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Loader2 } from "lucide-react";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Fetch bikes based on search query
  const { data, isLoading } = useBikes({
    search: search.length >= 2 ? search : undefined,
    limit: 10,
  });

  const bikes = data?.bikes || [];

  const handleSelect = (slug: string) => {
    onOpenChange(false);
    router.push(`/bike/${slug}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search bikes or brands..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Searching...</span>
          </div>
        )}
        {!isLoading && search.length >= 2 && bikes.length === 0 && (
          <CommandEmpty>No results found for &quot;{search}&quot;.</CommandEmpty>
        )}
        {!isLoading && search.length < 2 && (
          <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
        )}

        {bikes.length > 0 && (
          <CommandGroup heading="Bikes Found">
            {bikes.map((bike: Bike) => (
              <CommandItem
                key={bike.id}
                onSelect={() => handleSelect(bike.slug)}
                className="cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{bike.brand_name} {bike.name}</span>
                  <span className="text-xs text-muted-foreground">{bike.category}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
