"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu,
    X,
    Search,
    Heart,
    User,
    ChevronDown,
    Bike,
    Newspaper,
    LayoutGrid,
    Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthStore, useWishlistStore, useUIStore } from "@/store";
import { SearchDialog } from "./search-dialog";

const navLinks = [
    { href: "/bikes", label: "Bikes", icon: Bike },
    { href: "/used-bikes", label: "Used Bikes", icon: Store },
    { href: "/news", label: "News", icon: Newspaper },
    { href: "/compare", label: "Compare", icon: LayoutGrid },
    { href: "/brands", label: "Brands", icon: LayoutGrid },
];

export function Header() {
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuthStore();
    const { bikeIds } = useWishlistStore();
    const { isMobileMenuOpen, setMobileMenuOpen, isSearchOpen, setSearchOpen } =
        useUIStore();
    const wishlistCount = bikeIds.size;

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                            <Bike className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="hidden font-bold text-xl sm:inline-block">
                            MrBike<span className="text-primary">BD</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                                    pathname === link.href ||
                                        pathname.startsWith(link.href + "/")
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="flex items-center gap-2">
                        {/* Search Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSearchOpen(true)}
                            className="hidden sm:flex"
                        >
                            <Search className="h-5 w-5" />
                            <span className="sr-only">Search</span>
                        </Button>

                        {/* Wishlist */}
                        <Link href="/profile?tab=wishlist">
                            <Button variant="ghost" size="icon" className="relative">
                                <Heart className="h-5 w-5" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                        {wishlistCount > 9 ? "9+" : wishlistCount}
                                    </span>
                                )}
                                <span className="sr-only">Wishlist</span>
                            </Button>
                        </Link>

                        {/* User Menu */}
                        {isAuthenticated && user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        {user.image ? (
                                            <img
                                                src={user.image}
                                                alt={user.name}
                                                className="h-6 w-6 rounded-full"
                                            />
                                        ) : (
                                            <User className="h-5 w-5" />
                                        )}
                                        <span className="hidden sm:inline-block max-w-24 truncate">
                                            {user.name}
                                        </span>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile">My Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile?tab=listings">My Listings</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile?tab=wishlist">Wishlist</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/sell-bike">Sell Bike</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button asChild size="sm" className="hidden sm:flex">
                                <Link href="/api/auth/signin">Sign In</Link>
                            </Button>
                        )}

                        {/* Mobile Menu Trigger */}
                        <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-80">
                                <nav className="flex flex-col gap-4 mt-8">
                                    <Link
                                        href="/"
                                        className="flex items-center gap-2 mb-4"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                                            <Bike className="h-5 w-5 text-primary-foreground" />
                                        </div>
                                        <span className="font-bold text-xl">
                                            MrBike<span className="text-primary">BD</span>
                                        </span>
                                    </Link>

                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                                pathname === link.href
                                                    ? "bg-primary text-primary-foreground"
                                                    : "hover:bg-accent"
                                            )}
                                        >
                                            <link.icon className="h-5 w-5" />
                                            {link.label}
                                        </Link>
                                    ))}

                                    <hr className="my-2" />

                                    <Link
                                        href="/profile"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent"
                                    >
                                        <User className="h-5 w-5" />
                                        Profile
                                    </Link>

                                    <Link
                                        href="/profile?tab=wishlist"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent"
                                    >
                                        <Heart className="h-5 w-5" />
                                        Wishlist
                                        {wishlistCount > 0 && (
                                            <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                                {wishlistCount}
                                            </span>
                                        )}
                                    </Link>

                                    <hr className="my-2" />

                                    {!isAuthenticated && (
                                        <Button asChild className="mx-4">
                                            <Link href="/api/auth/signin">Sign In with Google</Link>
                                        </Button>
                                    )}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            {/* Search Dialog */}
            <SearchDialog open={isSearchOpen} onOpenChange={setSearchOpen} />
        </>
    );
}
