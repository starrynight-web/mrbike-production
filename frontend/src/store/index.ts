import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { Bike, User, UsedBike } from "@/types";

// ============================================
// AUTH STORE
// ============================================
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set) => ({
                user: null,
                isAuthenticated: false,
                isLoading: true,
                login: (user) =>
                    set({ user, isAuthenticated: !!user, isLoading: false }),
                setLoading: (isLoading) => set({ isLoading }),
                logout: () =>
                    set({ user: null, isAuthenticated: false, isLoading: false }),
            }),
            {
                name: "auth-storage",
                partialize: (state) => ({ user: state.user }),
            }
        ),
        { name: "AuthStore" }
    )
);

// ============================================
// COMPARE STORE
// ============================================
interface CompareState {
    bikes: Bike[];
    maxBikes: number;
    addBike: (bike: Bike) => boolean;
    removeBike: (bikeId: string) => void;
    clearAll: () => void;
    isBikeSelected: (bikeId: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
    devtools(
        persist(
            (set, get) => ({
                bikes: [],
                maxBikes: 3,
                addBike: (bike) => {
                    const { bikes, maxBikes } = get();
                    if (bikes.length >= maxBikes) return false;
                    if (bikes.some((b) => b.id === bike.id)) return false;
                    set({ bikes: [...bikes, bike] });
                    return true;
                },
                removeBike: (bikeId) => {
                    set({ bikes: get().bikes.filter((b) => b.id !== bikeId) });
                },
                clearAll: () => set({ bikes: [] }),
                isBikeSelected: (bikeId) => get().bikes.some((b) => b.id === bikeId),
            }),
            { name: "compare-storage" }
        ),
        { name: "CompareStore" }
    )
);

// ============================================
// WISHLIST STORE
// ============================================
interface WishlistState {
    bikeIds: Set<string>;
    addToWishlist: (bikeId: string) => void;
    removeFromWishlist: (bikeId: string) => void;
    isInWishlist: (bikeId: string) => boolean;
    toggleWishlist: (bikeId: string) => void;
    clearWishlist: () => void;
    syncFromServer: (bikeIds: string[]) => void;
}

export const useWishlistStore = create<WishlistState>()(
    devtools(
        persist(
            (set, get) => ({
                bikeIds: new Set<string>(),
                addToWishlist: (bikeId) => {
                    const newSet = new Set(get().bikeIds);
                    newSet.add(bikeId);
                    set({ bikeIds: newSet });
                },
                removeFromWishlist: (bikeId) => {
                    const newSet = new Set(get().bikeIds);
                    newSet.delete(bikeId);
                    set({ bikeIds: newSet });
                },
                isInWishlist: (bikeId) => get().bikeIds.has(bikeId),
                toggleWishlist: (bikeId) => {
                    const { bikeIds, addToWishlist, removeFromWishlist } = get();
                    if (bikeIds.has(bikeId)) {
                        removeFromWishlist(bikeId);
                    } else {
                        addToWishlist(bikeId);
                    }
                },
                clearWishlist: () => set({ bikeIds: new Set<string>() }),
                syncFromServer: (bikeIds) => set({ bikeIds: new Set(bikeIds) }),
            }),
            {
                name: "wishlist-storage",
                storage: {
                    getItem: (name) => {
                        const str = localStorage.getItem(name);
                        if (!str) return null;
                        const parsed = JSON.parse(str);
                        return {
                            ...parsed,
                            state: {
                                ...parsed.state,
                                bikeIds: new Set(parsed.state.bikeIds || []),
                            },
                        };
                    },
                    setItem: (name, value) => {
                        const serialized = {
                            ...value,
                            state: {
                                ...value.state,
                                bikeIds: Array.from(value.state.bikeIds),
                            },
                        };
                        localStorage.setItem(name, JSON.stringify(serialized));
                    },
                    removeItem: (name) => localStorage.removeItem(name),
                },
            }
        ),
        { name: "WishlistStore" }
    )
);

// ============================================
// UI STORE
// ============================================
interface UIState {
    isMobileMenuOpen: boolean;
    isSearchOpen: boolean;
    isFilterDrawerOpen: boolean;
    theme: "light" | "dark" | "system";
    setMobileMenuOpen: (open: boolean) => void;
    setSearchOpen: (open: boolean) => void;
    setFilterDrawerOpen: (open: boolean) => void;
    setTheme: (theme: "light" | "dark" | "system") => void;
    toggleMobileMenu: () => void;
}

export const useUIStore = create<UIState>()(
    devtools(
        persist(
            (set, get) => ({
                isMobileMenuOpen: false,
                isSearchOpen: false,
                isFilterDrawerOpen: false,
                theme: "system",
                setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
                setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
                setFilterDrawerOpen: (isFilterDrawerOpen) => set({ isFilterDrawerOpen }),
                setTheme: (theme) => set({ theme }),
                toggleMobileMenu: () =>
                    set({ isMobileMenuOpen: !get().isMobileMenuOpen }),
            }),
            {
                name: "ui-storage",
                partialize: (state) => ({ theme: state.theme }),
            }
        ),
        { name: "UIStore" }
    )
);

// ============================================
// FILTER STORE
// ============================================
interface FilterState {
    selectedBrands: string[];
    selectedCategories: string[];
    priceRange: [number, number];
    ccRange: [number, number];
    sortBy: string;
    setSelectedBrands: (brands: string[]) => void;
    setSelectedCategories: (categories: string[]) => void;
    setPriceRange: (range: [number, number]) => void;
    setCcRange: (range: [number, number]) => void;
    setSortBy: (sort: string) => void;
    resetFilters: () => void;
}

const defaultFilterState = {
    selectedBrands: [] as string[],
    selectedCategories: [] as string[],
    priceRange: [0, 10000000] as [number, number],
    ccRange: [0, 1000] as [number, number],
    sortBy: "popularity",
};

export const useFilterStore = create<FilterState>()(
    devtools(
        (set) => ({
            ...defaultFilterState,
            setSelectedBrands: (selectedBrands) => set({ selectedBrands }),
            setSelectedCategories: (selectedCategories) => set({ selectedCategories }),
            setPriceRange: (priceRange) => set({ priceRange }),
            setCcRange: (ccRange) => set({ ccRange }),
            setSortBy: (sortBy) => set({ sortBy }),
            resetFilters: () => set(defaultFilterState),
        }),
        { name: "FilterStore" }
    )
);

// ============================================
// RECENT VIEWS STORE
// ============================================
interface RecentViewsState {
    recentBikes: Array<{ id: string; slug: string; name: string; viewedAt: number }>;
    recentUsedBikes: Array<{ id: string; name: string; viewedAt: number }>;
    addRecentBike: (bike: { id: string; slug: string; name: string }) => void;
    addRecentUsedBike: (usedBike: { id: string; name: string }) => void;
    clearRecentViews: () => void;
}

const MAX_RECENT_ITEMS = 10;

export const useRecentViewsStore = create<RecentViewsState>()(
    devtools(
        persist(
            (set, get) => ({
                recentBikes: [],
                recentUsedBikes: [],
                addRecentBike: (bike) => {
                    const { recentBikes } = get();
                    const filtered = recentBikes.filter((b) => b.id !== bike.id);
                    const newRecent = [
                        { ...bike, viewedAt: Date.now() },
                        ...filtered,
                    ].slice(0, MAX_RECENT_ITEMS);
                    set({ recentBikes: newRecent });
                },
                addRecentUsedBike: (usedBike) => {
                    const { recentUsedBikes } = get();
                    const filtered = recentUsedBikes.filter((b) => b.id !== usedBike.id);
                    const newRecent = [
                        { ...usedBike, viewedAt: Date.now() },
                        ...filtered,
                    ].slice(0, MAX_RECENT_ITEMS);
                    set({ recentUsedBikes: newRecent });
                },
                clearRecentViews: () =>
                    set({ recentBikes: [], recentUsedBikes: [] }),
            }),
            { name: "recent-views-storage" }
        ),
        { name: "RecentViewsStore" }
    )
);
