"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  Zap,
  Star,
  Check,
  Calculator,
  X,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice, calculateEMI } from "@/lib/utils";
import {
  useBike,
  useBikeReviews,
  useSubmitReview,
  useSimilarBikes,
} from "@/hooks/use-bikes";
import { useUsedBikes } from "@/hooks/use-used-bikes";
import {
  useWishlistStore,
  useCompareStore,
  useAuthStore,
  useHasHydrated,
} from "@/store";
import { EMI_CONFIG } from "@/config/constants";
import type { Review, UsedBike, Bike } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface BikeDetailClientProps {
  slug: string;
}

// Types for variant data from bikes.json
interface VariantQuickSpecs {
  engineCapacity: string;
  transmission: string;
  maxPower: string;
  maxTorque: string;
  fuelTank: string;
  kerbWeight: string;
  mileageCompany: string;
  mileageUser: string;
  topspeedCompany: string;
  topspeedUser: string;
}

interface VariantData {
  fullName: string;
  label: string;
  price: number;
  images: string[];
  quickSpecs: VariantQuickSpecs;
  fuelEfficiency: string;
  frontTire: string;
  rearTire: string;
  brakingSystem: string;
  headlightType: string;
  abs: boolean;
  ledHeadlight: boolean;
  usbPort: boolean;
  pros: Record<string, string>;
  cons: Record<string, string>;
}

interface ApiVariant {
  id: string | number;
  variant_key?: string;
  variant_name?: string;
  name?: string;
  color?: string;
  price?: number | string;
  mileage_company?: string;
  mileage_user?: string;
  topspeed_company?: string;
  topspeed_user?: string;
  tire_type?: string;
  braking_system?: string;
  images?: string[];
  [key: string]: unknown;
}

// Quick Specs Panel Component with Company/User toggle
function QuickSpecsPanel({
  currentVariant,
}: {
  currentVariant: VariantData | undefined;
}) {
  const [specsSource, setSpecsSource] = useState<"company" | "user">("company");

  const specs = [
    {
      label: "Engine Capacity",
      value: currentVariant?.quickSpecs?.engineCapacity || "N/A",
      icon: Zap,
    },
    {
      label: "Mileage",
      value:
        specsSource === "company"
          ? currentVariant?.quickSpecs?.mileageCompany || "N/A"
          : currentVariant?.quickSpecs?.mileageUser || "N/A",
      icon: Fuel,
      dynamic: true,
    },
    {
      label: "Top Speed",
      value:
        specsSource === "company"
          ? currentVariant?.quickSpecs?.topspeedCompany || "N/A"
          : currentVariant?.quickSpecs?.topspeedUser || "N/A",
      icon: Gauge,
      dynamic: true,
    },
    {
      label: "Transmission",
      value: currentVariant?.quickSpecs?.transmission || "N/A",
      icon: Zap,
    },
    {
      label: "Max Power",
      value: currentVariant?.quickSpecs?.maxPower || "N/A",
      icon: Zap,
    },
    {
      label: "Max Torque",
      value: currentVariant?.quickSpecs?.maxTorque || "N/A",
      icon: Zap,
    },
    {
      label: "Fuel Tank",
      value: currentVariant?.quickSpecs?.fuelTank || "N/A",
      icon: Fuel,
    },
    {
      label: "Kerb Weight",
      value: currentVariant?.quickSpecs?.kerbWeight || "N/A",
      icon: Gauge,
    },
  ];

  return (
    <div className="bg-card border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Quick Specifications</h3>
        <Select
          value={specsSource}
          onValueChange={(value: "company" | "user") => setSpecsSource(value)}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="company">Company Claimed</SelectItem>
            <SelectItem value="user">User Claimed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className={cn(
              "p-2.5 rounded-lg bg-muted/50 border border-transparent",
              spec.dynamic && "border-primary/20 bg-primary/5",
            )}
          >
            <p className="text-xs text-muted-foreground">{spec.label}</p>
            <p className="font-semibold text-sm">{spec.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper to extract brake types from system string
function getBrakeTypes(system: string) {
  const s = system.toLowerCase();
  if (s.includes("dual") || s.includes("double"))
    return { front: "Disc", rear: "Disc" };
  if (s.includes("drum")) return { front: "Drum", rear: "Drum" };
  return { front: "Disc", rear: "Drum" }; // Default common configuration
}

function VariantComparison({
  variants,
}: {
  variants: Record<string, VariantData>;
}) {
  const variantKeys = Object.keys(variants);
  const bikeName =
    variants[variantKeys[0]]?.fullName.split(" ")[0] +
    " " +
    variants[variantKeys[0]]?.fullName.split(" ")[1]; // Get brand + model

  type ComparisonRow = {
    label: string;
    key?: keyof VariantData;
    render?: (v: VariantData) => React.ReactNode;
  };

  const rows: ComparisonRow[] = [
    {
      label: "Price",
      render: (v: VariantData) => (
        <span className="font-semibold text-primary">
          {formatPrice(v.price)}
        </span>
      ),
    },
    { label: "Braking System", key: "brakingSystem" },
    {
      label: "Brake Type (Front)",
      render: (v: VariantData) =>
        getBrakeTypes(v.brakingSystem).front +
        (v.brakingSystem.includes("Disc") ? " (276mm)" : ""), // Added dummy size for visual match
    },
    {
      label: "Brake Type (Rear)",
      render: (v: VariantData) =>
        getBrakeTypes(v.brakingSystem).rear +
        (v.brakingSystem.includes("Disc") ? " (220mm)" : ""), // Added dummy size for visual match
    },
    {
      label: "Tire Type",
      render: (v: VariantData) => (
        <div className="flex flex-col text-xs">
          <span>{v.frontTire} (Front)</span>
          <span>{v.rearTire} (Rear)</span>
        </div>
      ),
    },
    {
      label: "Mileage (Company Claimed)",
      render: (v: VariantData) => v.quickSpecs.mileageCompany,
    },
    {
      label: "Mileage (User Claimed)",
      render: (v: VariantData) => v.quickSpecs.mileageUser,
    },
    {
      label: "Top Speed (Company Claimed)",
      render: (v: VariantData) => v.quickSpecs.topspeedCompany,
    },
    {
      label: "Top Speed (User Claimed)",
      render: (v: VariantData) => v.quickSpecs.topspeedUser,
    },
  ];

  return (
    <div className="bg-card border rounded-xl p-6 h-full flex flex-col shadow-sm">
      <h3 className="text-lg font-bold mb-2">Variant Comparison</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Compare the key differences between {bikeName} variants to choose the
        right one for you.
      </p>

      <div className="overflow-x-auto flex-1 -mx-6 px-6">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left font-semibold text-gray-700 p-4 border-b sticky left-0 bg-card z-10 w-[200px]">
                Feature
              </th>
              {variantKeys.map((key) => (
                <th
                  key={key}
                  className="text-left font-semibold text-gray-900 p-4 border-b min-w-[160px] align-top"
                >
                  {variants[key].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-card z-10 border-r md:border-none shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] md:shadow-none">
                  {row.label}
                </td>
                {variantKeys.map((key) => (
                  <td key={key} className="p-4 text-gray-600">
                    {typeof row.render === "function"
                      ? row.render(variants[key])
                      : String(
                          variants[key][row.key as keyof VariantData] || "",
                        )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SimilarNewBikes({ slug }: { slug: string }) {
  // Fetch similar bikes from API
  const { data: similarBikes, isLoading, error } = useSimilarBikes(slug);

  return (
    <div className="bg-card border rounded-xl p-6 h-full flex flex-col shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Similar Bikes</h3>
        <Button variant="link" className="text-primary h-auto p-0" asChild>
          <Link href="/bikes">View All</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Loading similar bikes...
        </div>
      ) : error ||
        !similarBikes ||
        (Array.isArray(similarBikes) && similarBikes.length === 0) ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          {error
            ? "Cannot Fetch Similar Bikes"
            : "No similar bikes found in this price range."}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {(Array.isArray(similarBikes) ? similarBikes : []).map(
            (bike: Bike) => {
              const bikeId = bike.id || bike.slug;
              const bikeName = bike.name || "";
              const bikePrice = bike.price || bike.priceRange?.min || 0;

              // Handle various image structures from API
              const bikeImage =
                bike.thumbnailUrl ||
                bike.primary_image ||
                bike.images?.[0] ||
                "/placeholder-bike.png"; // Fallback image

              const bikeSpecs =
                bike.specsSummary ||
                `${bike.specs?.displacement || ""}cc • ${
                  bike.specs?.maxPower || ""
                }`;

              return (
                <Link
                  key={bikeId}
                  href={`/bike/${bikeId}`}
                  className="group block"
                >
                  <div className="flex gap-4 p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/30 transition-all">
                    <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-muted relative">
                      <Image
                        src={bikeImage}
                        alt={bikeName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {bikeName}
                      </h4>
                      <p className="text-primary font-bold text-sm mt-0.5">
                        {formatPrice(bikePrice)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {bikeSpecs}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}

export function BikeDetailClient({ slug }: BikeDetailClientProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantKey, setSelectedVariantKey] = useState<string>("std");
  const [emiMonths] = useState(EMI_CONFIG.defaultTenureMonths);
  const [specsTab, setSpecsTab] = useState("general");

  // Fetch bike data from API
  const { data: bike, isLoading, error } = useBike(slug);
  const { data: reviews } = useBikeReviews(bike?.id || "");

  // Fetch used bikes
  const { data: usedBikesData } = useUsedBikes({ limit: 4 });
  const similarUsedBikes = useMemo(() => {
    if (!usedBikesData) return [];

    const rawList = Array.isArray(usedBikesData)
      ? usedBikesData
      : (usedBikesData as any).results || [];

    return rawList.map((item: any) => ({
      id: item.id?.toString() || "",
      bikeName: item.bike_model_name || item.title || "Unknown Bike",
      brandName: item.brand || "Unknown Brand",
      sellerId: item.seller?.toString() || "",
      sellerName: item.seller_name || "Unknown Seller",
      sellerPhone: item.seller_phone || "",
      images: item.images?.map((img: any) => img.url) || [],
      thumbnailUrl: item.image_url || "/bikes/default.webp",
      price: Number(item.price) || 0,
      year: item.manufacturing_year || new Date().getFullYear(),
      kmDriven: item.mileage || 0,
      condition: item.condition || "good",
      accidentHistory: false,
      location: {
        city: item.location || "Unknown",
        area: "",
      },
      status: item.status || "active",
      isFeatured: item.is_featured || false,
      isVerified: item.is_verified || false,
      expiresAt: new Date(),
      createdAt: item.created_at || new Date(),
      updatedAt: item.updated_at || new Date(),
    }));
  }, [usedBikesData]);

  // Store hooks
  const { isInFavorites, toggleFavorite } = useWishlistStore();
  const { isBikeSelected, addBike, removeBike } = useCompareStore();
  const wishlistHydrated = useHasHydrated(useWishlistStore);
  const compareHydrated = useHasHydrated(useCompareStore);
  const storesReady = wishlistHydrated && compareHydrated;

  // Transform API data to expected frontend structure
  const variants = useMemo(() => {
    if (!bike) return {};

    const variantsMap: Record<string, VariantData> = {};
    const apiVariants = bike.variants || [];

    if (Array.isArray(apiVariants) && apiVariants.length > 0) {
      apiVariants.forEach((v: ApiVariant) => {
        const variantName = v.variant_name || v.name || v.color || "Standard";
        const key =
          v.variant_key ||
          (v.id ? String(v.id) : "") ||
          variantName.toLowerCase().replace(/\s+/g, "-");

        variantsMap[key] = {
          fullName:
            `${bike.brand?.name || bike.brand_name || ""} ${bike.name} ${variantName}`.trim(),
          label: variantName,
          price: Number(v.price) || 0,
          images:
            v.images && Array.isArray(v.images) && v.images.length > 0
              ? v.images
              : bike.images && bike.images.length > 0
                ? bike.images
                : [bike.primary_image || "/placeholder-bike.png"],
          quickSpecs: {
            engineCapacity:
              bike.detailed_specs?.displacement ||
              (bike.engine_capacity ? `${bike.engine_capacity} cc` : "N/A"),
            transmission:
              bike.detailed_specs?.gearbox ||
              (bike.gears ? `${bike.gears} Speed` : "N/A"),
            maxPower: bike.detailed_specs?.max_power || bike.max_power || "N/A",
            maxTorque:
              bike.detailed_specs?.max_torque || bike.max_torque || "N/A",
            fuelTank:
              bike.detailed_specs?.fuel_tank_capacity ||
              (bike.fuel_capacity ? `${bike.fuel_capacity} L` : "N/A"),
            kerbWeight:
              bike.detailed_specs?.kerb_weight ||
              (bike.curb_weight ? `${bike.curb_weight} kg` : "N/A"),
            mileageCompany: v.mileage_company || "N/A",
            mileageUser: v.mileage_user || "N/A",
            topspeedCompany: v.topspeed_company || "N/A",
            topspeedUser: v.topspeed_user || "N/A",
          },
          fuelEfficiency: v.mileage_user || v.mileage_company || "N/A",
          frontTire: bike.detailed_specs?.tyres_front || v.tire_type || "N/A",
          rearTire: bike.detailed_specs?.tyres_rear || v.tire_type || "N/A",
          brakingSystem:
            v.braking_system || bike.detailed_specs?.braking_system || "N/A",
          headlightType: bike.detailed_specs?.lighting?.headlight || "N/A",
          abs: (v.braking_system || "").toLowerCase().includes("abs"),
          ledHeadlight: (bike.detailed_specs?.lighting?.headlight || "")
            .toLowerCase()
            .includes("led"),
          usbPort: false,
          pros: {},
          cons: {},
        };
      });
    } else {
      // Create a default variant from the bike model itself if no variants exist
      variantsMap["std"] = {
        fullName:
          `${bike.brand?.name || bike.brand_name || ""} ${bike.name}`.trim(),
        label: "Standard",
        price: Number(bike.price) || Number(bike.priceRange?.min) || 0,
        images: bike.images || [bike.primary_image || "/placeholder-bike.png"],
        quickSpecs: {
          engineCapacity:
            bike.detailed_specs?.displacement ||
            (bike.engine_capacity ? `${bike.engine_capacity} cc` : "N/A"),
          transmission:
            bike.detailed_specs?.gearbox ||
            (bike.gears ? `${bike.gears} Speed` : "N/A"),
          maxPower: bike.detailed_specs?.max_power || bike.max_power || "N/A",
          maxTorque:
            bike.detailed_specs?.max_torque || bike.max_torque || "N/A",
          fuelTank:
            bike.detailed_specs?.fuel_tank_capacity ||
            (bike.fuel_capacity ? `${bike.fuel_capacity} L` : "N/A"),
          kerbWeight:
            bike.detailed_specs?.kerb_weight ||
            (bike.curb_weight ? `${bike.curb_weight} kg` : "N/A"),
          mileageCompany: "N/A",
          mileageUser: "N/A",
          topspeedCompany: "N/A",
          topspeedUser: "N/A",
        },
        fuelEfficiency: "N/A",
        frontTire: bike.detailed_specs?.tyres_front || bike.tyre_type || "N/A",
        rearTire: bike.detailed_specs?.tyres_rear || bike.tyre_type || "N/A",
        brakingSystem: bike.detailed_specs?.braking_system || "N/A",
        headlightType: bike.detailed_specs?.lighting?.headlight || "N/A",
        abs: false,
        ledHeadlight: false,
        usbPort: false,
        pros: {},
        cons: {},
      };
    }

    return variantsMap;
  }, [bike]);

  const variantKeys = Object.keys(variants);
  const currentVariant =
    variants[selectedVariantKey] || variants[variantKeys[0]];

  const defaultImage = bike?.primary_image || "/placeholder-bike.png";
  const currentImages = currentVariant?.images?.length
    ? currentVariant.images
    : [defaultImage];

  if (isLoading) {
    return <BikeDetailSkeleton />;
  }

  if (error || !bike) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Bike Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The bike you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Button asChild>
          <Link href="/bikes">Browse All Bikes</Link>
        </Button>
      </div>
    );
  }

  // Use API data
  const bikeName = currentVariant?.fullName || bike?.name || "";
  const brandName = bike?.brand?.name || bike?.brand_name || "";
  const basePrice = currentVariant?.price || bike?.priceRange?.min || 0;
  const bikeRating = bike?.rating?.average || 4.5;
  const bikeId = String(bike?.id ?? slug);
  const bikeDescription = bike?.description || "";
  const totalReviews = reviews?.length || 0;

  const isFavorited = isInFavorites(bikeId);
  const isInCompare = bike ? isBikeSelected(String(bike.id)) : false;

  const downPayment = basePrice * (EMI_CONFIG.downPaymentPercent / 100);
  const loanAmount = basePrice - downPayment;
  const emi = calculateEMI(
    loanAmount,
    EMI_CONFIG.defaultInterestRate,
    emiMonths,
  );

  const handleCompareToggle = () => {
    if (!bike || !storesReady) return;
    const id = String(bike.id);
    if (isInCompare) {
      removeBike(id);
    } else {
      addBike(bike);
    }
  };

  const handleFavoriteClick = () => {
    if (!storesReady) return;
    toggleFavorite(bikeId);
  };

  const handleVariantChange = (variantKey: string) => {
    setSelectedVariantKey(variantKey);
    setActiveImageIndex(0);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/bikes" className="hover:text-foreground">
              Bikes
            </Link>
            {brandName && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link
                  href={`/brands/${brandName.toLowerCase()}`}
                  className="hover:text-foreground"
                >
                  {brandName}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{bikeName}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="container py-6 md:py-10">
        {/* Top Row: Name/Rating (left) + Action Buttons (right) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-muted-foreground text-sm mb-1">{brandName}</p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              {bikeName}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{bikeRating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground text-sm">
                ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={isFavorited ? "default" : "outline"}
              size="sm"
              onClick={handleFavoriteClick}
              disabled={!storesReady}
              className="gap-2"
            >
              <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
              {isFavorited ? "Saved to Favorites" : "Add to Favorites"}
            </Button>
            <Button
              type="button"
              variant={isInCompare ? "default" : "outline"}
              size="sm"
              onClick={handleCompareToggle}
              disabled={!bike || !storesReady}
              className="gap-2"
            >
              <Check className={cn("h-4 w-4", !isInCompare && "opacity-0")} />
              {isInCompare ? "In Compare" : "Add to Compare"}
            </Button>
          </div>
        </div>

        {/* Main Content: Image Carousel + Variant/Specs Panel */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Image Carousel (takes 1 column) */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full rounded-xl overflow-hidden bg-muted">
              <motion.div
                key={activeImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full relative"
              >
                <Image
                  src={currentImages[activeImageIndex] || defaultImage}
                  alt={`${bikeName} - Image ${activeImageIndex + 1}`}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>

              {/* Navigation Arrows */}
              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === 0 ? currentImages.length - 1 : prev - 1,
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === currentImages.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Category Badge */}
              <Badge className="absolute top-3 left-3 capitalize">
                {bike?.category || "sport"}
              </Badge>

              {/* Image Counter */}
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white text-sm font-medium">
                {activeImageIndex + 1} / {currentImages.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {currentImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={cn(
                    "relative shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden border-2 transition-all",
                    activeImageIndex === index
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent opacity-60 hover:opacity-100",
                  )}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel: Variant Selector + Quick Specs */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Variant Selector */}
            <div className="bg-card border rounded-xl p-4 flex flex-col h-full">
              <h3 className="font-semibold text-sm mb-3">Select Variant</h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {variantKeys.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleVariantChange(key)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all",
                      selectedVariantKey === key
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:border-primary/50 hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{variants[key].label}</span>
                      <span className="text-xs font-medium">
                        {formatPrice(variants[key].price)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Specifications */}
            <QuickSpecsPanel currentVariant={currentVariant} />
          </div>
        </div>

        {/* Bottom Row: Price Info + Similar Used Bikes */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Price Information */}
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Price Information</h3>
            <div className="space-y-4">
              {/* Price */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ex-showroom Price</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(basePrice)}
                </span>
              </div>

              {/* Estimated EMI */}
              <div className="flex items-center justify-between py-3 border-t border-b">
                <div>
                  <span className="text-muted-foreground text-sm">
                    Estimated EMI
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {EMI_CONFIG.downPaymentPercent}% down,{" "}
                    {EMI_CONFIG.defaultInterestRate}% rate, {emiMonths} months
                  </p>
                </div>
                <span className="text-lg font-semibold text-primary">
                  {formatPrice(emi)}/mo
                </span>
              </div>

              {/* EMI Calculator Link */}
              <Button variant="outline" className="w-full gap-2" asChild>
                <Link href="/emi-calculator">
                  <Calculator className="h-4 w-4" />
                  Open Full EMI Calculator
                </Link>
              </Button>
            </div>
          </div>

          {/* Similar Used Bikes Carousel */}
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Similar Used Bikes</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/used-bikes">View All</Link>
              </Button>
            </div>
            {similarUsedBikes.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
                {similarUsedBikes.map((usedBike: UsedBike) => (
                  <Link
                    key={usedBike.id}
                    href={`/used-bike/${usedBike.id}`}
                    className="shrink-0 w-40 bg-muted/50 rounded-lg overflow-hidden border hover:shadow-md transition-shadow block"
                  >
                    <div className="aspect-[4/3] bg-muted relative">
                      <Image
                        src={usedBike.thumbnailUrl || defaultImage}
                        alt={usedBike.bikeName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium line-clamp-1">
                        {usedBike.bikeName}
                      </p>
                      <p className="text-primary font-semibold text-sm">
                        {formatPrice(usedBike.price)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {usedBike.condition}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">
                No similar used bikes available
              </p>
            )}
          </div>
        </div>

        {/* Variant Comparison & Similar Bikes Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <VariantComparison variants={variants} />
          </div>
          <div className="lg:col-span-1">
            <SimilarNewBikes
              currentPrice={currentVariant?.price || 0}
              currentId={bikeId}
              slug={slug}
            />
          </div>
        </div>
      </section>

      {/* Full Specifications Section */}
      <section className="container py-8">
        <div className="bg-card rounded-xl border p-6">
          <h2 className="text-2xl font-bold mb-4">Full Specifications</h2>

          {/* Variant Selector for Specs */}
          {variantKeys.length > 1 && (
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">
                Select Variant to View Specifications
              </Label>
              <Select
                value={selectedVariantKey}
                onValueChange={setSelectedVariantKey}
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {variantKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {variants[key].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Specs Tabs */}
          <Tabs value={specsTab} onValueChange={setSpecsTab} className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
              {[
                { id: "general", label: "General Comments" },
                { id: "engine", label: "Engine & Performance" },
                { id: "transmission", label: "Transmission & Brakes" },
                { id: "dimensions", label: "Dimensions & Weight" },
                { id: "features", label: "Features & Electricals" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="general" className="mt-0">
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-3">
                  General Information
                </h3>
                <div className="space-y-3">
                  <SpecRow
                    label="Description"
                    value={
                      bikeDescription ||
                      "No description available for this bike."
                    }
                  />
                  <SpecRow
                    label="Registered Date"
                    value={
                      bike?.launchDate
                        ? new Date(bike.launchDate).toLocaleDateString()
                        : "N/A"
                    }
                  />
                  <SpecRow label="Owner Count" value="N/A" />
                  <SpecRow
                    label="Color"
                    value={
                      currentVariant?.color ||
                      bike?.variants?.[0]?.color ||
                      "N/A"
                    }
                  />
                  <SpecRow
                    label="Assembly"
                    value={brandName ? `${brandName} Factory` : "N/A"}
                  />
                  <SpecRow label="Body Type" value={bike?.category || "N/A"} />
                  <SpecRow
                    label="Fuel Type"
                    value={currentVariant?.quickSpecs?.fuelType || "Petrol"}
                  />
                  <SpecRow
                    label="Mileage"
                    value={currentVariant?.quickSpecs?.mileageCompany || "N/A"}
                  />
                  <SpecRow label="Condition" value="New" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="engine" className="mt-0">
              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-primary mb-3">
                  Engine Specifications
                </h3>
                <div className="space-y-3">
                  <SpecRow
                    label="Engine Type"
                    value="Single Cylinder, 4-Stroke, Liquid-Cooled, DOHC"
                  />
                  <SpecRow
                    label="Displacement"
                    value={
                      currentVariant?.quickSpecs?.engineCapacity || "149.16 cc"
                    }
                  />
                  <SpecRow
                    label="Max Power"
                    value={
                      currentVariant?.quickSpecs?.maxPower ||
                      "16.4 HP @ 9,000 RPM"
                    }
                  />
                  <SpecRow
                    label="Max Torque"
                    value={
                      currentVariant?.quickSpecs?.maxTorque ||
                      "13.7 Nm @ 7,000 RPM"
                    }
                  />
                  <SpecRow label="Bore x Stroke" value="57.3 mm x 57.8 mm" />
                  <SpecRow label="Compression Ratio" value="11.3:1" />
                  <SpecRow
                    label="Fuel System"
                    value="PGM-FI (Programmed Fuel Injection)"
                  />
                  <SpecRow label="Starting" value="Electric Start" />
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-3">Performance</h3>
                <div className="space-y-3">
                  <SpecRow
                    label="Top Speed"
                    value={
                      currentVariant?.quickSpecs?.topspeedCompany ||
                      "130 km/h (Approx.)"
                    }
                  />
                  <SpecRow label="0-60 km/h Acceleration" value="4.2 seconds" />
                  <SpecRow
                    label="Fuel Efficiency"
                    value={currentVariant?.fuelEfficiency || "35-40 kmpl"}
                    badge="City: 35-40 kmpl | Highway: 40-45 kmpl"
                  />
                  <SpecRow
                    label="Fuel Type"
                    value="Petrol (Octane 91 or higher)"
                  />
                  <SpecRow
                    label="Fuel Tank Capacity"
                    value={currentVariant?.quickSpecs?.fuelTank || "12 Liters"}
                  />
                  <SpecRow label="Reserve Fuel Capacity" value="2 Liters" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="transmission" className="mt-0">
              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-primary mb-3">
                  Transmission
                </h3>
                <div className="space-y-3">
                  <SpecRow
                    label="Transmission Type"
                    value={
                      currentVariant?.quickSpecs?.transmission ||
                      "6-Speed Manual"
                    }
                  />
                  <SpecRow label="Clutch" value="Wet Multi-plate" />
                  <SpecRow label="Final Drive" value="Chain Drive" />
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-3">
                  Brakes & Suspension
                </h3>
                <div className="space-y-3">
                  <SpecRow label="Front Brake" value="Disc - 276mm Petal" />
                  <SpecRow label="Rear Brake" value="Disc - 220mm" />
                  <SpecRow
                    label="Braking System"
                    value={
                      currentVariant?.brakingSystem ||
                      "Dual Channel Disc Brakes"
                    }
                  />
                  <SpecRow
                    label="ABS"
                    value={
                      currentVariant?.abs ? "Dual Channel ABS" : "Not Available"
                    }
                  />
                  <SpecRow label="Front Suspension" value="Inverted Forks" />
                  <SpecRow label="Rear Suspension" value="Monoshock" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="dimensions" className="mt-0">
              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-primary mb-3">Dimensions</h3>
                <div className="space-y-3">
                  <SpecRow label="Length" value="2,020 mm" />
                  <SpecRow label="Width" value="756 mm" />
                  <SpecRow label="Height" value="1,055 mm" />
                  <SpecRow label="Wheelbase" value="1,351 mm" />
                  <SpecRow label="Ground Clearance" value="155 mm" />
                  <SpecRow label="Seat Height" value="795 mm" />
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-3">
                  Weight & Tyres
                </h3>
                <div className="space-y-3">
                  <SpecRow
                    label="Kerb Weight"
                    value={currentVariant?.quickSpecs?.kerbWeight || "136 kg"}
                  />
                  <SpecRow
                    label="Front Tyre"
                    value={currentVariant?.frontTire || "110/70-17 Tubeless"}
                  />
                  <SpecRow
                    label="Rear Tyre"
                    value={currentVariant?.rearTire || "150/60-17 Tubeless"}
                  />
                  <SpecRow label="Wheel Type" value="Alloy" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="mt-0">
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-3">
                  Features & Electricals
                </h3>
                <div className="space-y-3">
                  <SpecRow
                    label="Headlight Type"
                    value={currentVariant?.headlightType || "Halogen"}
                    isFeature
                    available={currentVariant?.ledHeadlight}
                  />
                  <SpecRow
                    label="Taillight"
                    value="LED"
                    isFeature
                    available={true}
                  />
                  <SpecRow
                    label="USB Charging Port"
                    value={
                      currentVariant?.usbPort ? "Available" : "Not Available"
                    }
                    isFeature
                    available={currentVariant?.usbPort}
                  />
                  <SpecRow
                    label="ABS"
                    value={
                      currentVariant?.abs ? "Dual Channel" : "Not Available"
                    }
                    isFeature
                    available={currentVariant?.abs}
                  />
                  <SpecRow
                    label="Digital Console"
                    value="Full LCD"
                    isFeature
                    available={true}
                  />
                  <SpecRow label="Battery" value="12V, 5Ah MF" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Pros and Cons Section */}
      {currentVariant?.pros && currentVariant?.cons && (
        <section className="container py-8">
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-2xl font-bold mb-6">
              Pros and Cons of {bikeName}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Advantages */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Check className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-green-600">
                    Advantages
                  </h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(currentVariant.pros).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                      <p className="text-sm">
                        <span className="font-semibold capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}:{" "}
                        </span>
                        <span className="text-muted-foreground">
                          {value as string}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disadvantages */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <X className="h-5 w-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-red-600">
                    Disadvantages
                  </h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(currentVariant.cons).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3">
                      <X className="h-4 w-4 text-red-500 mt-1 shrink-0" />
                      <p className="text-sm">
                        <span className="font-semibold capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}:{" "}
                        </span>
                        <span className="text-muted-foreground">
                          {value as string}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Summary / Verdict Section */}
      <section className="container py-8">
        <div className="bg-card rounded-xl border p-6">
          <h2 className="text-2xl font-bold mb-4">{bikeName} Summary</h2>

          {bikeDescription ? (
            <>
              <p className="text-muted-foreground mb-6 whitespace-pre-line">
                {bikeDescription}
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-6">
                The {bikeName} is a premium{" "}
                {currentVariant?.quickSpecs?.engineCapacity || "150cc"}{" "}
                motorcycle that combines sporty performance with everyday
                practicality. Positioned as a neo-sports café racer, it brings{" "}
                {brandName}&apos;s legendary reliability to the sporty commuter
                segment.
              </p>

              {/* Key Highlights */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
                <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                  Key Highlights:
                </p>
                <p className="text-sm text-muted-foreground">
                  The {bikeName} stands out with its liquid-cooled{" "}
                  {currentVariant?.quickSpecs?.engineCapacity || "149cc"}{" "}
                  engine, delivering{" "}
                  {currentVariant?.quickSpecs?.maxPower || "16.4 HP"} of power
                  and {currentVariant?.quickSpecs?.maxTorque || "13.7 Nm"} of
                  torque through a smooth 6-speed transmission. Its distinctive
                  design features sharp lines, LED lighting, and a muscular
                  stance that appeals to young riders.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-sm">
                  <span className="font-semibold">Performance & Handling:</span>{" "}
                  <span className="text-muted-foreground">
                    The bike offers a balanced riding experience with responsive
                    throttle, precise handling, and stable cornering. The
                    suspension setup (inverted forks at front and monoshock at
                    rear) provides good comfort for daily commuting while
                    maintaining sporty characteristics.
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Target Audience:</span>{" "}
                  <span className="text-muted-foreground">
                    Perfect for urban riders who want a stylish daily commuter
                    with occasional weekend touring capabilities. It appeals to
                    those who value {brandName}&apos;s reliability but want more
                    excitement than traditional commuter bikes.
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Verdict:</span>{" "}
                  <span className="text-muted-foreground">
                    The {bikeName} justifies its premium price with excellent
                    build quality, attractive styling, and dependable
                    performance. While the base variant offers good value, the
                    ABS versions provide important safety features for
                    Bangladesh&apos;s road conditions. It&apos;s an ideal choice
                    for riders wanting a sporty-looking bike without
                    compromising on {brandName}&apos;s renowned reliability.
                  </span>
                </p>
              </div>
            </>
          )}

          {/* Score Cards */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {bikeRating.toFixed(1)}/5
              </p>
              <p className="font-medium">Overall Rating</p>
              <p className="text-xs text-muted-foreground">
                Based on {totalReviews}{" "}
                {totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">9.2/10</p>
              <p className="font-medium">Value for Money</p>
              <p className="text-xs text-muted-foreground">
                Premium features at competitive price
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">8.8/10</p>
              <p className="font-medium">Bangladesh Suitability</p>
              <p className="text-xs text-muted-foreground">
                Well suited for local road conditions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rate This Bike Section */}
      <section className="container py-8">
        <div className="bg-card rounded-xl border p-6">
          <RatingSection bikeId={bikeId} reviews={reviews || []} />
        </div>
      </section>
    </div>
  );
}

// Spec Row Component
function SpecRow({
  label,
  value,
  badge,
  isFeature,
  available,
}: {
  label: string;
  value: string;
  badge?: string;
  isFeature?: boolean;
  available?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-primary text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{value}</span>
        {badge && (
          <Badge
            variant="secondary"
            className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          >
            {badge}
          </Badge>
        )}
        {isFeature &&
          available !== undefined &&
          (available ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-red-500" />
          ))}
      </div>
    </div>
  );
}

// Rating Section Component with Category Ratings
function RatingSection({
  bikeId,
  reviews,
}: {
  bikeId: string;
  reviews: Review[];
}) {
  const { isAuthenticated } = useAuthStore();
  const { mutate: submitReview, isPending } = useSubmitReview();
  const [performanceRating, setPerformanceRating] = useState(0);
  const [looksRating, setLooksRating] = useState(0);
  const [reliabilityRating, setReliabilityRating] = useState(0);
  const [opinion, setOpinion] = useState("");

  const overallRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 4.5;

  // Calculate review breakdown
  const reviewBreakdown = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const totalReviews = reviews.length || 128;
  const getPercentage = (count: number) =>
    totalReviews > 0 ? ((count / totalReviews) * 100).toFixed(1) : "0.0";

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast.error("Please login to write a review");
      return;
    }
    if (
      performanceRating === 0 ||
      looksRating === 0 ||
      reliabilityRating === 0
    ) {
      toast.error("Please rate all categories to submit");
      return;
    }

    const avgRating = (performanceRating + looksRating + reliabilityRating) / 3;
    submitReview(
      { bikeId, rating: avgRating, comment: opinion },
      {
        onSuccess: () => {
          toast.success("Review submitted successfully!");
          setPerformanceRating(0);
          setLooksRating(0);
          setReliabilityRating(0);
          setOpinion("");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to submit review");
        },
      },
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Rate This Bike</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Rating Form */}
        <div>
          <p className="font-medium mb-4">How would you rate this bike?</p>

          {/* Performance Rating */}
          <div className="mb-6">
            <p className="font-semibold text-sm mb-1">Performance</p>
            <StarRatingInput
              value={performanceRating}
              onChange={setPerformanceRating}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Engine power, acceleration, handling, braking
            </p>
          </div>

          {/* Looks & Design Rating */}
          <div className="mb-6">
            <p className="font-semibold text-sm mb-1">Looks & Design</p>
            <StarRatingInput value={looksRating} onChange={setLooksRating} />
            <p className="text-xs text-muted-foreground mt-1">
              Styling, color options, build quality
            </p>
          </div>

          {/* Reliability Rating */}
          <div className="mb-6">
            <p className="font-semibold text-sm mb-1">Reliability</p>
            <StarRatingInput
              value={reliabilityRating}
              onChange={setReliabilityRating}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Durability, maintenance costs, brand reputation
            </p>
          </div>

          {/* Opinion */}
          <div className="mb-6">
            <p className="font-semibold text-sm mb-2">
              Your Opinion (Optional)
            </p>
            <Textarea
              placeholder="Share your experience with this bike..."
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={
              isPending ||
              (performanceRating === 0 &&
                looksRating === 0 &&
                reliabilityRating === 0)
            }
          >
            {isPending ? "Submitting..." : "Rate all categories to submit"}
          </Button>
        </div>

        {/* Right: Current Ratings Summary */}
        <div>
          <div className="bg-muted/30 rounded-xl p-6 border">
            <h3 className="font-semibold mb-4">Current Ratings Summary</h3>

            {/* Overall Score */}
            <div className="text-center mb-6">
              <p className="text-5xl font-bold text-primary">
                {overallRating.toFixed(1)}
              </p>
              <div className="flex justify-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      star <= Math.round(overallRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30",
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {totalReviews}{" "}
                {totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Star Rating Breakdown */}
            {totalReviews > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-sm mb-3">Rating Breakdown</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count =
                      reviewBreakdown[star as keyof typeof reviewBreakdown];
                    const percentage = getPercentage(count);
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs w-12">{star} Star</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          {percentage}% ({count})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category Breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-xs text-primary font-medium">Performance</p>
                <p className="text-lg font-bold">
                  {totalReviews > 0
                    ? (
                        reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                        totalReviews
                      ).toFixed(1)
                    : "4.6"}
                  /5
                </p>
                <p className="text-xs text-muted-foreground">
                  ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-primary font-medium">Looks</p>
                <p className="text-lg font-bold">
                  {totalReviews > 0
                    ? (
                        reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                        totalReviews
                      ).toFixed(1)
                    : "4.8"}
                  /5
                </p>
                <p className="text-xs text-muted-foreground">
                  ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-primary font-medium">Reliability</p>
                <p className="text-lg font-bold">
                  {totalReviews > 0
                    ? (
                        reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                        totalReviews
                      ).toFixed(1)
                    : "4.9"}
                  /5
                </p>
                <p className="text-xs text-muted-foreground">
                  ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                </p>
              </div>
            </div>

            {/* Recent Reviews */}
            {reviews.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-3">Recent Reviews</h4>
                <div className="space-y-3">
                  {reviews.slice(0, 3).map((review) => {
                    const reviewDate = review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString()
                      : "Recently";
                    return (
                      <div key={review.id}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={cn(
                                  "h-3 w-3",
                                  s <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground/30",
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            by {review.userName || "Anonymous"} • {reviewDate}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-xs text-muted-foreground italic">
                            &quot;{review.comment}&quot;
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Star Rating Input Component
function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "h-6 w-6 transition-colors",
              star <= (hover || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30",
            )}
          />
        </button>
      ))}
    </div>
  );
}

// Loading Skeleton
function BikeDetailSkeleton() {
  return (
    <div className="container py-10">
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <Skeleton className="aspect-[4/3] rounded-xl" />
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-20 h-16 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-24 rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
          <Skeleton className="h-32 rounded-xl" />
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
