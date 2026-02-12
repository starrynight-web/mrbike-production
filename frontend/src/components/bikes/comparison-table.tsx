"use client";

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
    <div className="border rounded-xl bg-background shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto touch-pan-y flex-1">
        {/* Header / Bike Info */}
        <div
          className={cn(
            "grid transition-all duration-300 bg-background border-b min-w-[600px] md:min-w-0",
            bikes.length === 2
              ? "grid-cols-[140px_1fr_1fr] md:grid-cols-[200px_1fr_1fr]"
              : "grid-cols-[140px_1fr_1fr_1fr] md:grid-cols-[200px_1fr_1fr_1fr]",
            "py-4",
          )}
        >
          <div
            className={cn(
              "px-4 flex font-semibold text-muted-foreground bg-muted/30 rounded-tl-xl items-end pb-4",
            )}
          >
            Key Differences
          </div>
          {bikes.map((bike) => (
            <div
              key={bike.id}
              className={cn(
                "px-4 border-r last:border-r-0 relative group transition-all duration-300 py-2",
              )}
            >
              <button
                onClick={() => onRemove(bike.id)}
                className="absolute top-1 right-1 p-1 rounded-full bg-muted/80 hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-all z-10"
                title="Remove from compare"
              >
                <X className="h-3 w-3" />
              </button>

              <div
                className={cn(
                  "flex transition-all duration-300 flex-col gap-3",
                )}
              >
                <div
                  className={cn(
                    "relative rounded-lg overflow-hidden bg-muted shrink-0 transition-all duration-300 h-24 md:h-32 lg:h-40 w-full",
                  )}
                >
                  <Image
                    src={bike.thumbnailUrl || "/placeholder-bike.webp"}
                    alt={bike.name}
                    width={300}
                    height={225}
                    className="w-full h-full object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/bike/${bike.slug}`}
                    className={cn(
                      "font-bold hover:underline transition-all duration-300 text-base min-h-[3rem] line-clamp-2",
                    )}
                  >
                    {bike.name}
                  </Link>
                  <p
                    className={cn(
                      "text-primary font-bold transition-all duration-300 text-sm mt-1",
                    )}
                  >
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
                  className="w-full mt-1 h-8 text-xs"
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
            "grid divide-y min-w-[600px] md:min-w-0",
            bikes.length === 2
              ? "grid-cols-[140px_1fr_1fr] md:grid-cols-[200px_1fr_1fr]"
              : "grid-cols-[140px_1fr_1fr_1fr] md:grid-cols-[200px_1fr_1fr_1fr]",
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
      </div>

      {/* Footer Action */}
      <div className="p-4 flex justify-end bg-muted/10 border-t mt-auto">
        <Button variant="link" asChild>
          <Link href="/bikes" className="flex items-center gap-1">
            Add more bikes to compare <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
