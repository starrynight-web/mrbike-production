"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import type { Bike } from "@/types";

interface ComparisonTableProps {
  bikes: Bike[];
  onRemove: (bikeId: string) => void;
}

export function ComparisonTable({ bikes, onRemove }: ComparisonTableProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper to determine the "winner" for a numeric spec
  const getWinnerId = (
    accessor: (bike: Bike) => number,
    type: "high" | "low" = "high",
  ): string | null => {
    if (bikes.length < 2) return null;

    let bestValue = type === "high" ? -Infinity : Infinity;
    let winnerId: string | null = null;
    let isTie = false;

    bikes.forEach((bike) => {
      const value = accessor(bike);
      if (type === "high") {
        if (value > bestValue) {
          bestValue = value;
          winnerId = bike.id;
          isTie = false;
        } else if (value === bestValue) {
          isTie = true;
        }
      } else {
        if (value < bestValue) {
          bestValue = value;
          winnerId = bike.id;
          isTie = false;
        } else if (value === bestValue) {
          isTie = true;
        }
      }
    });

    return isTie ? null : winnerId;
  };

  // Calculate winners
  const winners = {
    price: getWinnerId((b) => b.priceRange?.min ?? b.price ?? 0, "low"),
    mileage: getWinnerId((b) => b.specs?.mileage ?? 0),
    topSpeed: getWinnerId((b) => b.specs?.topSpeed ?? 0),
    power: getWinnerId((b) => parseFloat(b.specs?.maxPower || "0") || 0),
    torque: getWinnerId((b) => parseFloat(b.specs?.maxTorque || "0") || 0),
    weight: getWinnerId((b) => b.specs?.kerbWeight ?? 0, "low"),
    fuel: getWinnerId((b) => b.specs?.fuelCapacity ?? 0),
  };

  const renderCell = (
    bike: Bike,
    value: string | number | React.ReactNode,
    isWinner: boolean = false,
  ) => (
    <div
      key={bike.id}
      className={cn(
        "p-4 border-r last:border-r-0 flex items-center min-h-[60px]",
        isWinner &&
          "bg-green-50/50 dark:bg-green-900/10 font-medium text-green-700 dark:text-green-400",
      )}
    >
      {value}
      {isWinner && <Check className="ml-2 h-4 w-4 text-green-600" />}
    </div>
  );

  return (
    <div className="border rounded-xl overflow-hidden bg-background shadow-sm">
      {/* Header / Bike Info */}
      <div
        className={cn(
          "grid transition-all duration-300 z-40 bg-background border-b",
          bikes.length === 2
            ? "grid-cols-[200px_1fr_1fr]"
            : "grid-cols-[200px_1fr_1fr_1fr]",
          scrolled ? "sticky top-[65px] shadow-md" : "",
        )}
      >
        <div className="p-4 flex items-end font-semibold text-muted-foreground bg-muted/30">
          Key Differences
        </div>
        {bikes.map((bike) => (
          <div
            key={bike.id}
            className="p-4 border-r last:border-r-0 relative group"
          >
            <button
              onClick={() => onRemove(bike.id)}
              className="absolute top-2 right-2 p-1 rounded-full bg-muted/80 hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-all"
              title="Remove from compare"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col gap-3">
              <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-muted">
                <Image
                  src={bike.thumbnailUrl || "/placeholder-bike.webp"}
                  alt={bike.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div>
                <Link
                  href={`/bike/${bike.slug}`}
                  className="font-bold hover:underline line-clamp-2 min-h-[3rem]"
                >
                  {bike.name}
                </Link>
                <p className="text-primary font-bold mt-1">
                  {bike.priceRange
                    ? formatPrice(bike.priceRange.min)
                    : bike.price
                      ? formatPrice(bike.price)
                      : "Price TBD"}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                asChild
                className="w-full mt-1"
              >
                <Link href={`/bike/${bike.slug}`}>View Details</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Rows */}
      <div
        className={cn(
          "grid divide-y",
          bikes.length === 2
            ? "grid-cols-[200px_1fr_1fr]"
            : "grid-cols-[200px_1fr_1fr_1fr]",
        )}
      >
        {/* --- BASIC INFO --- */}
        <div className="col-span-full bg-muted/30 p-2 pl-4 text-xs font-bold uppercase tracking-wider text-muted-foreground mt-4 first:mt-0">
          Basic Info
        </div>

        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Brand
          </div>
          {bikes.map((bike) => renderCell(bike, bike.brand.name))}
        </div>
        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Category
          </div>
          {bikes.map((bike) =>
            renderCell(
              bike,
              <Badge variant="secondary" className="capitalize">
                {bike.category}
              </Badge>,
            ),
          )}
        </div>
        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Rating
          </div>
          {bikes.map((bike) =>
            renderCell(
              bike,
              bike.rating
                ? `${bike.rating.average}/5 (${bike.rating.count})`
                : "N/A",
            ),
          )}
        </div>

        {/* --- ENGINE & PERFORMANCE --- */}
        <div className="col-span-full bg-muted/30 p-2 pl-4 text-xs font-bold uppercase tracking-wider text-muted-foreground mt-4">
          Engine & Performance
        </div>

        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Displacement
          </div>
          {bikes.map((bike) =>
            renderCell(bike, `${bike.specs?.displacement || "N/A"}cc`),
          )}
        </div>
        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Max Power
          </div>
          {bikes.map((bike) =>
            renderCell(
              bike,
              bike.specs?.maxPower || "N/A",
              winners.power === bike.id,
            ),
          )}
        </div>
        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Max Torque
          </div>
          {bikes.map((bike) =>
            renderCell(
              bike,
              bike.specs?.maxTorque || "N/A",
              winners.torque === bike.id,
            ),
          )}
        </div>
        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Top Speed
          </div>
          {bikes.map((bike) =>
            renderCell(
              bike,
              `${bike.specs?.topSpeed || "N/A"} kmph`,
              winners.topSpeed === bike.id,
            ),
          )}
        </div>
        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Mileage
          </div>
          {bikes.map((bike) =>
            renderCell(
              bike,
              `${bike.specs?.mileage || "N/A"} kmpl`,
              winners.mileage === bike.id,
            ),
          )}
        </div>
        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Cooling
          </div>
          {bikes.map((bike) =>
            renderCell(bike, bike.specs?.cooling || "N/A"),
          )}
        </div>
        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Fuel Supply
          </div>
          {bikes.map((bike) =>
            renderCell(bike, bike.specs?.fuelSystem || "N/A"),
          )}
        </div>
        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Transmission
          </div>
          {bikes.map((bike) =>
            renderCell(bike, bike.specs?.transmission || "N/A"),
          )}
        </div>

        {/* --- DIMENSIONS & CHASSIS --- */}
        <div className="col-span-full bg-muted/30 p-2 pl-4 text-xs font-bold uppercase tracking-wider text-muted-foreground mt-4">
          Dimensions & Chassis
        </div>

        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Weight
          </div>
          {bikes.map((bike) =>
            renderCell(
              bike,
              `${bike.specs?.kerbWeight || "N/A"} kg`,
              winners.weight === bike.id,
            ),
          )}
        </div>
        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Fuel Capacity
          </div>
          {bikes.map((bike) =>
            renderCell(
              bike,
              `${bike.specs?.fuelCapacity || "N/A"} L`,
              winners.fuel === bike.id,
            ),
          )}
        </div>
        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Seat Height
          </div>
          {bikes.map((bike) =>
            renderCell(bike, `${bike.specs?.seatHeight || "N/A"} mm`),
          )}
        </div>
        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Ground Clearance
          </div>
          {bikes.map((bike) =>
            renderCell(bike, `${bike.specs?.groundClearance || "N/A"} mm`),
          )}
        </div>

        {/* --- BRAKES & TYRES --- */}
        <div className="col-span-full bg-muted/30 p-2 pl-4 text-xs font-bold uppercase tracking-wider text-muted-foreground mt-4">
          Brakes & Tyres
        </div>
        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            ABS
          </div>
          {bikes.map((bike) => renderCell(bike, bike.specs?.abs || "N/A"))}
        </div>
        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Front Brake
          </div>
          {bikes.map((bike) =>
            renderCell(bike, bike.specs?.frontBrake || "N/A"),
          )}
        </div>
        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Rear Brake
          </div>
          {bikes.map((bike) =>
            renderCell(bike, bike.specs?.rearBrake || "N/A"),
          )}
        </div>
        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Front Tyre
          </div>
          {bikes.map((bike) =>
            renderCell(bike, bike.specs?.frontTyre || "N/A"),
          )}
        </div>
        <div className="contents">
          <div className="p-4 font-medium text-muted-foreground bg-muted/5 flex items-center">
            Rear Tyre
          </div>
          {bikes.map((bike) =>
            renderCell(bike, bike.specs?.rearTyre || "N/A"),
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-4 flex justify-end bg-muted/10 border-t">
        <Button variant="link" asChild>
          <Link href="/bikes" className="flex items-center gap-1">
            Add more bikes to compare <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
