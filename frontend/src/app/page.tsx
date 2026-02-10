import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ChevronRight,
  Fuel,
  Star,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Zap,
  MapPin,
} from "lucide-react";
import { BIKE_CATEGORIES } from "@/config/constants";
import type { Bike, UsedBike } from "@/types";
import { api } from "@/lib/api-service";
import { sanitizeImageUrl, mapBike, mapUsedBike } from "@/lib/data-utils";
import { HeroSearch } from "@/components/layout/hero-search";
import { BikeCard } from "@/components/bikes/bike-card";
import { UsedBikeCard } from "@/components/used-bikes/used-bike-card";


// Emotional picks and brands remain static for now as they are design elements

const emotionalPicks = [
  {
    title: "Best Mileage Under ৳2 Lac",
    description: "Fuel-efficient commuters for daily rides",
    icon: Fuel,
    gradient: "from-green-500 to-emerald-600",
    href: "/bikes?priceMax=200000&sortBy=mileage",
  },
  {
    title: "Top Resale Sports Bikes",
    description: "High value retention when you upgrade",
    icon: TrendingUp,
    gradient: "from-blue-500 to-indigo-600",
    href: "/bikes?category=sport&sortBy=resale",
  },
  {
    title: "Trending Naked Bikes",
    description: "Most popular street fighters this month",
    icon: Sparkles,
    gradient: "from-orange-500 to-red-600",
    href: "/bikes?category=naked&sortBy=popularity",
  },
];

const popularBrands = [
  { name: "Yamaha", logo: "/brands/yamaha.svg", slug: "yamaha" },
  { name: "Honda", logo: "/brands/honda.svg", slug: "honda" },
  { name: "Suzuki", logo: "/brands/suzuki.svg", slug: "suzuki" },
  { name: "KTM", logo: "/brands/ktm.svg", slug: "ktm" },
  { name: "TVS", logo: "/brands/tvs.svg", slug: "tvs" },
  { name: "Bajaj", logo: "/brands/bajaj.svg", slug: "bajaj" },
  { name: "Hero", logo: "/brands/hero.svg", slug: "hero" },
  { name: "CFMoto", logo: "/brands/cfmoto.svg", slug: "cfmoto" },
];

export default async function HomePage() {
  let featuredBikes: Bike[] = [];
  let usedBikes: UsedBike[] = [];
  let fetchError = false;

  try {
    const [bikesResponse, usedBikesResponse] = await Promise.all([
      api.getBikes({ limit: 4 }),
      api.getUsedBikes({ limit: 4 }),
    ]);

    // Process featured bikes with error handling
    if (bikesResponse.success) {
      try {
        const rawData = (bikesResponse.data as any[]) || [];
        featuredBikes = rawData.map(mapBike);
      } catch (err) {
        console.error("Error processing featured bikes:", err);
        featuredBikes = [];
      }
    }

    // Process used bikes with robust error handling
    if (usedBikesResponse.success) {
      try {
        const rawUsed = (usedBikesResponse.data as any[]) || [];
        usedBikes = rawUsed.map(mapUsedBike);
      } catch (err) {
        console.error("Error processing used bikes:", err);
        usedBikes = [];
      }
    } else {
      fetchError = true;
    }
  } catch (error) {
    console.error("Failed to fetch home page data:", error);
    fetchError = true;
  }

  return (
    <div className="flex flex-col">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden bg-linear-to-br from-background via-background to-accent py-16 md:py-24">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Zap className="w-3 h-3 mr-1" />
              Bangladesh&apos;s #1 Motorcycle Platform
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Find Your Perfect{" "}
              <span className="text-gradient">Motorcycle</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover, compare, and buy motorcycles. Explore 300+ bikes, read
              reviews, and find the best deals in Bangladesh.
            </p>

            {/* Search Bar */}
            <HeroSearch />

            {/* Category Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {BIKE_CATEGORIES.map((category) => (
                <Link
                  key={category.value}
                  href={`/bikes?category=${category.value}`}
                >
                  <Badge
                    variant="outline"
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {category.icon} {category.label}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== POPULAR BIKES ==================== */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Popular Bikes</h2>
              <p className="text-muted-foreground mt-1">
                Most searched motorcycles this month
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/bikes">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {fetchError && featuredBikes.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p>
                Unable to load featured bikes right now. Showing popular picks
                later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredBikes.map((bike: Bike) => (
                <BikeCard key={bike.id} bike={bike} showCompare={false} />
              ))}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/bikes">
                View All Bikes <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ==================== EMOTIONAL PICKS ==================== */}
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Discover Your Ride
            </h2>
            <p className="text-muted-foreground">
              Curated picks based on what Bangladeshi riders love
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {emotionalPicks.map((pick, index) => (
              <Link key={index} href={pick.href}>
                <Card className="group relative overflow-hidden h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${pick.gradient} opacity-90`}
                  />
                  <CardContent className="relative p-6 md:p-8 text-white">
                    <pick.icon className="h-10 w-10 mb-4 opacity-80" />
                    <h3 className="text-xl font-bold mb-2">{pick.title}</h3>
                    <p className="text-white/80 mb-4">{pick.description}</p>
                    <div className="flex items-center text-sm font-medium">
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== USED BIKES SECTION ==================== */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Used Bikes</h2>
              <p className="text-muted-foreground mt-1">
                Quality pre-owned motorcycles near you
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/used-bikes">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {usedBikes.length > 0
              ? usedBikes.map((bike) => (
                <UsedBikeCard key={bike.id} bike={bike} />
              ))
              : [1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-4/3 bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-6 bg-muted rounded animate-pulse w-2/3 mb-3" />
                    <div className="flex justify-between">
                      <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                      <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* ==================== BRANDS SECTION ==================== */}
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Popular Brands
            </h2>
            <p className="text-muted-foreground">
              Explore motorcycles from top manufacturers
            </p>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {popularBrands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden relative">
                  <Image
                    src={sanitizeImageUrl(brand.logo, "/bikes/default.webp")}
                    alt={brand.name}
                    fill
                    className="object-contain p-2"
                    loading="lazy"
                    sizes="64px"
                  />
                </div>
                <span className="text-xs md:text-sm font-medium text-center">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary to-orange-600 p-8 md:p-12 lg:p-16">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

            <div className="relative max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Sell Your Bike?
              </h2>
              <p className="text-lg text-white/80 mb-8">
                Post your ad for free and reach thousands of potential buyers
                across Bangladesh. Quick, easy, and trusted.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full px-8"
                  asChild
                >
                  <Link href="/sell-bike">Post Free Ad</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 text-white border-white/30 hover:bg-white/10"
                  asChild
                >
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}