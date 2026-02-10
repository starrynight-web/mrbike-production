"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSearch() {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (query.trim()) {
            router.push(`/bikes?search=${encodeURIComponent(query.trim())}`);
        } else {
            router.push("/bikes");
        }
    };

    return (
        <form
            onSubmit={handleSearch}
            className="relative max-w-xl mx-auto mb-8 flex items-center gap-2"
        >
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search bikes or brands..."
                    className="w-full h-14 pl-12 pr-24 text-lg rounded-full border-2 focus:border-primary"
                />
                <Button
                    type="submit"
                    size="lg"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6"
                >
                    Search
                </Button>
            </div>
        </form>
    );
}
