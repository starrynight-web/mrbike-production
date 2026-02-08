"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { Search, Loader2 } from "lucide-react";

export function SearchDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const router = useRouter();
    const [query, setQuery] = useState("");

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
