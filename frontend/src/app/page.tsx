import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Zap,
  Wind,
  Building2,
  CircleDot,
  Compass,
  Mountain,
  Plug,
  Bike,
} from "lucide-react";
import { BIKE_CATEGORIES } from "@/config/constants";
import type { Bike, UsedBike } from "@/types";
import { api } from "@/lib/api-service";
import { sanitizeImageUrl, mapBike, mapUsedBike } from "@/lib/data-utils";
import { HeroSearch } from "@/components/layout/hero-search";
import { PopularBikesCarousel } from "@/components/bikes/popular-bikes-carousel";
import { CompareYourChoiceSection } from "@/components/bikes/compare-your-choice-section";
import { UsedBikesCarousel } from "@/components/used-bikes/used-bikes-carousel";

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
      api.getBikes({ limit: 8 }),
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
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.webp"
            alt="Hero Background"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="w-full px-4 md:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* <Badge variant="secondary" className="mb-4">
              <Zap className="w-3 h-3 mr-1" />
              Bangladesh&apos;s #1 Motorcycle Platform
            </Badge> */}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Find Your Perfect{" "}
              <span className="text-gradient">Motorcycle</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover, compare, and buy used motorcycles. Explore 300+ bikes,
              read reviews, and find the best deals in Bangladesh.
            </p>

            {/* Search Bar */}
            <HeroSearch />

            {/* Category Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {BIKE_CATEGORIES.map((category) => {
                const Icon =
                  {
                    sport: Zap,
                    naked: Wind,
                    commuter: Building2,
                    scooter: CircleDot,
                    cruiser: Compass,
                    adventure: Mountain,
                    electric: Plug,
                  }[category.value] || Bike;

                return (
                  <Link
                    key={category.value}
                    href={`/bikes?category=${category.value}`}
                  >
                    <Badge
                      variant="outline"
                      className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" /> {category.label}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== POPULAR BIKES ==================== */}
      <section className="py-12 md:py-16">
        <div className="w-full px-4 md:px-8">
          <PopularBikesCarousel
            bikes={featuredBikes}
            fetchError={fetchError && featuredBikes.length === 0}
          />
        </div>
      </section>

      {/* ==================== COMPARE YOUR CHOICE ==================== */}
      <CompareYourChoiceSection />

      {/* ==================== USED BIKES SECTION ==================== */}
      <section className="py-12 md:py-16">
        <div className="w-full px-4 md:px-8">
          <UsedBikesCarousel bikes={usedBikes} />
        </div>
      </section>

      {/* ==================== BRANDS SECTION ==================== */}
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="w-full px-4 md:px-8">
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
        <div className="w-full px-4 md:px-8">
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
                  className="rounded-full px-8 text-white border-white/30 bg-transparent hover:bg-transparent hover:border-white transition-colors"
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
