import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Bike as BikeIcon,
} from "lucide-react";
import type { Bike, UsedBike } from "@/types";
import { api } from "@/lib/api-service";
import { mapBike, mapUsedBike, mapBrand } from "@/lib/data-utils";
import { PopularBikesCarousel } from "@/components/bikes/popular-bikes-carousel";
import { HomepageNewsSection } from "@/components/bikes/homepage-news-section";
import type { Brand } from "@/types";
import { UsedBikesCarousel } from "@/components/used-bikes/used-bikes-carousel";
import { CategoryShowcase } from "@/components/bikes/category-showcase";
import { HomeHeroCarousel } from "@/components/layout/home-hero-carousel";

export const metadata = {
  title: "Bike Price In Bangladesh 2026 | MrBikeBD — Bangladesh's #1 Motorcycle Platform",
  description: "Find latest motorcycle prices in Bangladesh 2026. Compare 300+ bikes from Yamaha, Honda, Suzuki, KTM, Bajaj. Buy/sell used bikes. Bangladesh's most trusted bike portal.",
  keywords: ["bike price in Bangladesh 2026", "motorcycle price BD", "used bike for sale Bangladesh", "Yamaha bike price Bangladesh", "Honda bike price BD", "buy sell bike Bangladesh", "second hand bike Bangladesh"],
};

export default async function HomePage() {
  let featuredBikes: Bike[] = [];
  let usedBikes: UsedBike[] = [];
  let fetchError = false;

  type PublicConfig = Record<string, string>;
  let config: PublicConfig = {};

  try {
    const configResponse = await api.getPublicConfig();
    config = configResponse.success ? ((configResponse.data as PublicConfig | undefined) ?? {}) : {};

    const popularIds = config?.popular_bike_ids ? JSON.parse(config.popular_bike_ids) : [];
    
    const [bikesResponse, usedBikesResponse] = await Promise.all([
      popularIds.length > 0 
        ? api.getBikes({ ids: popularIds.join(','), limit: 6 }) 
        : api.getBikes({ limit: 6 }),
      api.getUsedBikes({ limit: 4 }),
    ]);

    // Process featured bikes with error handling
    if (bikesResponse.success) {
      try {
        const rawData = (bikesResponse.data as unknown as Bike[]) || [];
        // If we fetched by IDs, ensure they are in the order specified or at least limited correctly
        featuredBikes = rawData.map(mapBike).slice(0, 6);
      } catch (err) {
        console.error("Error processing featured bikes:", err);
        featuredBikes = [];
      }
    }

    // Process used bikes with robust error handling
    if (usedBikesResponse.success) {
      try {
        const rawUsed = (usedBikesResponse.data as unknown as UsedBike[]) || [];
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

  // Configuration processing
  const heroTitle = config?.hero_title || "Bike Price In Bangladesh 2026";
  const heroSubtitle = config?.hero_subtitle || "Discover, compare, and buy motorcycles. Explore 300+ bikes, read reviews, and find the best deals in Bangladesh.";

  let dynamicBrands: Brand[] = [];
  try {
    const brandsResponse = await api.getBrands();
    if (brandsResponse.success && brandsResponse.data) {
      dynamicBrands = brandsResponse.data.map(mapBrand);
    }
  } catch (e) {
    console.error("Failed to fetch brands for homepage:", e);
  }

  return (
    <div className="flex flex-col">
      {/* ==================== HERO SECTION ==================== */}
      <HomeHeroCarousel title={heroTitle} subtitle={heroSubtitle} />

      {/* ==================== POPULAR BIKES ==================== */}
      <section className="py-12 md:py-16">
        <div className="w-full px-4 md:px-8">
          <PopularBikesCarousel
            bikes={featuredBikes}
            fetchError={fetchError && featuredBikes.length === 0}
          />
        </div>
      </section>

      {/* ==================== USED BIKES SECTION ==================== */}
      {usedBikes.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/40">
          <div className="w-full px-4 md:px-8">
            <UsedBikesCarousel bikes={usedBikes} />
          </div>
        </section>
      )}



      {/* ==================== CATEGORIES SECTION ==================== */}
      <section className="py-12 md:py-16">
        <div className="w-full px-4 md:px-8">
          <CategoryShowcase />
        </div>
      </section>

      {/* ==================== BRANDS SECTION ==================== */}
      <section className="py-12 md:py-16 bg-muted/40">
        <div className="w-full px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div className="space-y-2">
              <Badge
                variant="outline"
                className="text-primary border-primary/20 bg-primary/5"
              >
                <BikeIcon className="w-3 h-3 mr-1" />
                Manufacturers
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Popular <span className="text-primary">Brands</span>
              </h2>
              <p className="text-muted-foreground">
                Explore motorcycles from top manufacturers in Bangladesh.
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden md:flex group">
              <Link href="/brands">
                All Brands
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {dynamicBrands.slice(0, 16).map((brand, idx) => (
              <Link
                key={`${brand.slug}-${idx}`}
                href={`/brands/${brand.slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden relative">
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={`${brand.name || "Brand"} logo`}
                      fill
                      className="object-contain p-2"
                      loading="lazy"
                      sizes="64px"
                    />
                  ) : (
                    <BikeIcon className="w-8 h-8 text-muted-foreground/40" />
                  )}
                </div>
                <span className="text-xs md:text-sm font-medium text-center line-clamp-1">
                  {brand.name || "Unknown Brand"}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-8 flex justify-center md:hidden">
            <Link
              href="/brands"
              className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-6"
            >
              View All Brands <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== LATEST NEWS SECTION ==================== */}
      <HomepageNewsSection />

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-16 md:py-24 bg-muted/40">
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
