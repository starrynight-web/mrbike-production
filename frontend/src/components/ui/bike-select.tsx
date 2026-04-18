"use client";

import { useState, useEffect } from "react";
import { Search, X, LoaderCircle, Check } from "lucide-react";
import { adminAPI } from "@/lib/admin-api";
import { Input } from "./input";
import { Badge } from "./badge";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";

interface BikeSelectProps {
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    max?: number;
}

export function BikeSelect({ selectedIds, onChange, max = 6 }: BikeSelectProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bikes, setBikes] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchBikes = async () => {
            try {
                setLoading(true);
                const res = await adminAPI.getAllBikes({ search, limit: 10 });
                setBikes(res.results || []);
            } catch (err) {
                console.error("Failed to fetch bikes:", err);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchBikes();
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const toggleBike = (id: number) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(i => i !== id));
        } else if (selectedIds.length < max) {
            onChange([...selectedIds, id]);
        }
    };

    const selectedBikes = bikes.filter(b => selectedIds.includes(b.id));

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-lg bg-muted/30">
                {selectedIds.map(id => {
                    const bike = bikes.find(b => b.id === id);
                    return (
                        <Badge key={id} variant="secondary" className="gap-1 px-3 py-1">
                            {bike?.name || `Bike ID: ${id}`}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => toggleBike(id)} />
                        </Badge>
                    );
                })}
                {selectedIds.length === 0 && (
                    <p className="text-sm text-muted-foreground italic px-2 py-1">No bikes selected.</p>
                )}
            </div>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        disabled={selectedIds.length >= max}
                    >
                        {selectedIds.length >= max 
                            ? `Maximum ${max} bikes reached` 
                            : "Search and add bikes..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command className="w-full">
                        <CommandInput 
                            placeholder="Type bike name..." 
                            value={search} 
                            onValueChange={setSearch} 
                        />
                        <CommandList>
                            <CommandEmpty>
                                {loading ? "Searching..." : "No bikes found."}
                            </CommandEmpty>
                            <CommandGroup>
                                {bikes.map((bike) => (
                                    <CommandItem
                                        key={bike.id}
                                        value={bike.name}
                                        onSelect={() => {
                                            toggleBike(bike.id);
                                            // Keep open for multi-select until max
                                            if (selectedIds.length + 1 >= max) {
                                                setOpen(false);
                                            }
                                        }}
                                        className={cn(
                                            "flex items-center justify-between",
                                            selectedIds.includes(bike.id) && "opacity-50 pointer-events-none"
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{bike.name}</span>
                                            <span className="text-xs text-muted-foreground">{bike.brand_name} | {bike.category}</span>
                                        </div>
                                        {selectedIds.includes(bike.id) && <Check className="h-4 w-4" />}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <p className="text-[10px] text-muted-foreground">
                Selected bikes will appear in the "Popular Bikes" carousel on the homepage. Limit: {max}.
            </p>
        </div>
    );
}
