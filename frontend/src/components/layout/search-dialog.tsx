"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const handleSelect = (id: string) => {
    onOpenChange(false);
    // router.push(`/bike/${id}`); // Example
    console.log("Selected:", id);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => handleSelect("bike-1")}>
            Yamaha R15 V4
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("bike-2")}>
            Suzuki Gixxer SF
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
