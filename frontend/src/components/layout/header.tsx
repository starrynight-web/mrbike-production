"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  Heart,
  User,
  ChevronDown,
  Bike,
  Newspaper,
  LayoutGrid,
  Store,
  Bell,
  Shield,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useAuthStore, useWishlistStore, useUIStore } from "@/store";
import { SearchDialog } from "@/components/layout/search-dialog";

const navLinks = [
  { href: "/bikes", label: "Bikes", icon: Bike },
  { href: "/used-bikes", label: "Used Bikes", icon: Store },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/compare", label: "Compare", icon: LayoutGrid },
  { href: "/brands", label: "Brands", icon: LayoutGrid },
  { href: "/dealers", label: "Dealers", icon: Store },
];

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { bikeIds } = useWishlistStore();
  const { isMobileMenuOpen, setMobileMenuOpen, isSearchOpen, setSearchOpen } =
    useUIStore();
  const wishlistCount = bikeIds.size;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-4 md:px-8 flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/full_logo_dark.png"
              alt="MrBikeBD"
              width={160}
              height={40}
              className="h-20 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
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

            {/* Post your bike */}
            <Button
              className="hidden sm:flex group overflow-hidden transition-all duration-300 ease-in-out hover:w-[140px] w-[90px] justify-start px-3 relative"
              asChild
            >
              <Link href="/sell-bike" className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 shrink-0" />
                <span className="relative inline-block text-left">
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 pointer-events-none"
                  >
                    Sell your bike
                  </span>
                  <span
                    aria-hidden
                    className="whitespace-nowrap opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none"
                  >
                    Sell
                  </span>
                </span>
              </Link>
            </Button>

            {/* Notifications */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 flex h-2 w-2 items-center justify-center rounded-full bg-primary ring-2 ring-background"></span>
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between p-4 border-b">
                    <span className="font-bold">Notifications</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-primary"
                    >
                      Mark all as read
                    </Button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-4 flex gap-3 hover:bg-accent cursor-pointer transition-colors border-b">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bike className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-primary">
                          Listing Approved!
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          Your ad for Yamaha R15 V3 has been approved and is now
                          live.
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          2 hours ago
                        </p>
                      </div>
                    </div>
                    <div className="p-4 flex gap-3 hover:bg-accent cursor-pointer transition-colors border-b">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Newspaper className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          New News Article
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          The 2026 Honda CBR model launch in Bangladesh.
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Yesterday
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 text-center border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      asChild
                    >
                      <Link href="/profile?tab=notifications">
                        View All Notifications
                      </Link>
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "User"}
                        width={24}
                        height={24}
                        className="rounded-full"
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
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin"
                          className="font-bold text-primary flex items-center gap-2"
                        >
                          <Shield className="h-4 w-4" /> Admin Panel
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      logout();
                      signOut();
                    }}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="hidden sm:flex">
                <Link href="/login">Sign In</Link>
              </Button>
            )}

            {/* Quick nav card menu (mobile/tablet) — toggleable card, not sidebar */}
            <DropdownMenu
              open={isMobileMenuOpen}
              onOpenChange={setMobileMenuOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden h-9 w-9 rounded-lg border bg-muted/50 hover:bg-muted shadow-sm"
                >
                  <LayoutGrid className="h-5 w-5" />
                  <span className="sr-only">Quick navigation</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-[320px] rounded-xl border bg-card p-4 shadow-lg"
              >
                <div className="grid grid-cols-3 gap-2">
                  {navLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-lg p-4 transition-colors hover:bg-accent focus:bg-accent",
                          pathname === link.href ||
                            pathname.startsWith(link.href + "/")
                            ? "bg-accent text-accent-foreground"
                            : "",
                        )}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <link.icon className="h-5 w-5 text-muted-foreground" />
                        </span>
                        <span className="text-xs font-medium text-center">
                          {link.label}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem asChild>
                    <Link
                      href="/sell-bike"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-col items-center gap-2 rounded-lg p-4 transition-colors hover:bg-accent focus:bg-accent"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        <PlusCircle className="h-5 w-5 text-primary-foreground" />
                      </span>
                      <span className="text-xs font-medium text-center">
                        Post your bike
                      </span>
                    </Link>
                  </DropdownMenuItem>
                </div>
                {!isAuthenticated && (
                  <>
                    <DropdownMenuSeparator className="my-3" />
                    <Button asChild className="w-full" size="sm">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                    </Button>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Search Dialog */}
      <SearchDialog open={isSearchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
