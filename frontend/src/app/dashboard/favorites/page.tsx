"use client";

import { FavoritesTab } from "@/components/profile/favorites-tab";

export default function FavoritesPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Favorites</h2>
        <p className="text-muted-foreground">New bike models you've marked as favorites.</p>
      </div>
      <FavoritesTab />
    </div>
  );
}
