"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Store,
  ShieldCheck,
  Wrench,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-service";

// Data from original HTML
const CITIES = [
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Sylhet",
  "Dinajpur",
  "Khulna",
  "Barisal",
  "Rangpur",
];

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Genuine Products",
    desc: "Authentic bikes, parts, and accessories",
  },
  {
    icon: Wrench,
    title: "Expert Service",
    desc: "Trained technicians and proper tools",
  },
  {
    icon: CheckCircle,
    title: "Valid Warranty",
    desc: "Manufacturer-backed warranty coverage",
  },
];

const STATS = [
  { value: "500+", label: "Authorized Dealers", sub: "Across Bangladesh" },
  { value: "20+", label: "Top Brands", sub: "From around the world" },
  { value: "24/7", label: "Availability", sub: "Updated dealer information" },
  {
    value: "100%",
    label: "Verified Information",
    sub: "Authentic dealer details",
  },
];

export default function DealersPage() {
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await api.getBrands();
        if (response.success && response.data) {
          // Extract brand names assuming API returns objects with 'name' property
          const brandNames = (response.data as any[]).map((b: { name: string }) => b.name);
          setBrands(brandNames);
        }
      } catch (error) {
        console.error("Failed to fetch brands", error);
      }
    };
    fetchBrands();
  }, []);

  const handleSearch = () => {
    if (!selectedBrand || !selectedCity) return;

    // Construct Google Maps Embed URL dynamically
    const query = encodeURIComponent(
      `${selectedBrand} dealer ${selectedCity} Bangladesh`,
    );
    const newUrl = `https://www.google.com/maps/embed/v1/search?q=${query}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`;
    setMapUrl(newUrl);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section (Reference: About Page) */}
      <div className="bg-muted/30 border-b overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <Store size={400} />
        </div>
        <div className="container py-20 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
              Dealer Locator
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Authorized <span className="text-primary">Dealers</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Find authorized dealers for the world&apos;s top motorcycle brands
              in your area.
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                className="h-12 px-8"
                onClick={() => {
                  document
                    .getElementById("search-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Search className="mr-2 h-5 w-5" /> Find Dealers
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section (Reference: About Page Values) */}
      <div className="container py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, index) => (
            <div key={index} className="space-y-4 text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {stat.value.replace(/\D/g, "")}
                </span>
              </div>
              <div>
                <h3 className="text-3xl font-bold">{stat.value}</h3>
                <p className="text-muted-foreground text-sm font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search Section (Reference: Expense Calculator) */}
      <div id="search-section" className="bg-muted/30 py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center pb-8 border-b">
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">
                  Find Your Nearest Dealer
                </CardTitle>
                <CardDescription>
                  Select a brand and city to locate authorized dealers in your
                  area.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <Label>Select Brand</Label>
                    <Select
                      value={selectedBrand}
                      onValueChange={setSelectedBrand}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choose a brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select City</Label>
                    <Select
                      value={selectedCity}
                      onValueChange={setSelectedCity}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choose a city" />
                      </SelectTrigger>
                      <SelectContent>
                        {CITIES.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full h-12 text-lg"
                  onClick={handleSearch}
                  disabled={!selectedBrand || !selectedCity}
                >
                  <Search className="mr-2 h-5 w-5" /> Search Dealers
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="container py-20">
        <Card className="overflow-hidden shadow-lg border-muted">
          <div className="grid lg:grid-cols-3">
            {/* Map Container */}
            <div className="lg:col-span-2 h-[500px] bg-muted relative border-r">
              {mapUrl ? (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapUrl}
                  title="Dealer Locator Map"
                ></iframe>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-muted-foreground bg-muted/50">
                  <MapPin className="h-16 w-16 mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    Select a brand and city
                  </h3>
                  <p className="max-w-md">
                    Please choose a motorcycle brand and your city to view
                    authorized dealers in your area on the map.
                  </p>
                </div>
              )}
            </div>

            {/* Benefits Side Panel */}
            <div className="p-8 bg-card flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-8">
                Benefits of Authorized Dealers
              </h3>
              <div className="space-y-8">
                {BENEFITS.map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <benefit.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 text-lg">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 bg-muted/30 rounded-xl border border-dashed text-center">
                <Store className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">
                  Official dealer locations verified by manufacturers.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
