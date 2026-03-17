"use client";

import { WishlistTab } from "@/components/profile/wishlist-tab";

export default function WishlistPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Wishlist</h2>
        <p className="text-muted-foreground">Used bikes you've saved for later.</p>
      </div>
      <WishlistTab />
    </div>
  );
}
