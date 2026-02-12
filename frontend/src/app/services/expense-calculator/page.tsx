"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Calculator, Fuel } from "lucide-react";

export default function ExpenseCalculatorPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/50 border-b relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <Calculator size={400} />
        </div>
        <div className="container py-12 relative z-10">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Expense <span className="text-primary">Calculator</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Quickly estimate your bike-related expenses including monthly EMI
              and your fuel cost per trip.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12 max-w-4xl mx-auto space-y-8">
        <Tabs defaultValue="emi" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="emi" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" /> EMI Calculator
            </TabsTrigger>
            <TabsTrigger value="fuel" className="flex items-center gap-2">
              <Fuel className="h-4 w-4" /> Octane Cost Estimator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emi">
            <EMICalculator />
          </TabsContent>

          <TabsContent value="fuel">
            <FuelCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EMICalculator() {
  const [bikePrice, setBikePrice] = useState(150000);
  const [downPayment, setDownPayment] = useState(50000);
  const [interestRate, setInterestRate] = useState(12); // % per annum
  const [term, setTerm] = useState(12); // months

  // Calculate results directly from state (derived state)
  const principal = bikePrice - downPayment;
  const rate = interestRate / 1200;

  let emi = 0;
  let totalPayment = 0;

  if (principal > 0 && rate > 0 && term > 0) {
    const emiValue =
      (principal * rate * Math.pow(1 + rate, term)) /
      (Math.pow(1 + rate, term) - 1);

    const total = emiValue * term;

    emi = Math.round(emiValue);
    totalPayment = Math.round(total);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>EMI Calculator</CardTitle>
        <CardDescription>
          Plan your bike finance with our easy-to-use loan calculator.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Bike Price (BDT)</Label>
              <Input
                type="number"
                value={bikePrice}
                onChange={(e) => setBikePrice(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Down Payment (BDT)</Label>
              <Input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Interest Rate (%)</Label>
                <span className="font-bold text-primary">{interestRate}%</span>
              </div>
              <Slider
                value={[interestRate]}
                min={1}
                max={30}
                step={0.5}
                onValueChange={(vals) => setInterestRate(vals[0])}
              />
              <Input
                className="mt-2"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Loan Term (Months)</Label>
                <span className="font-bold text-primary">{term} Months</span>
              </div>
              <Slider
                value={[term]}
                min={3}
                max={60}
                step={1}
                onValueChange={(vals) => setTerm(vals[0])}
              />
              <Input
                className="mt-2"
                type="number"
                value={term}
                onChange={(e) => setTerm(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="bg-muted/30 p-6 rounded-xl flex flex-col justify-center space-y-6 text-center md:text-left">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monthly EMI</p>
              <p className="text-4xl font-bold text-primary">
                {emi.toLocaleString()} ৳
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Total Payable Amount
              </p>
              <p className="text-xl font-semibold">
                {totalPayment.toLocaleString()} ৳
              </p>
            </div>

            <div className="space-y-1 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Principal Amount</p>
              <p className="text-lg font-medium">
                {(bikePrice - downPayment).toLocaleString()} ৳
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FuelCalculator() {
  const [distance, setDistance] = useState(30); // km
  const [mileage, setMileage] = useState(45); // km/L
  const [fuelPrice, setFuelPrice] = useState(130); // Tk/L

  // Calculate directly
  let fuelCost = 0;
  if (distance > 0 && mileage > 0 && fuelPrice > 0) {
    const cost = (distance / mileage) * fuelPrice;
    fuelCost = Math.round(cost);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Octane Cost Estimator</CardTitle>
        <CardDescription>
          Estimate how much you&apos;ll spend on fuel for a given distance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Distance (km)</Label>
              <Input
                type="number"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                placeholder="Enter distance..."
              />
            </div>
            <div className="space-y-2">
              <Label>Fuel Efficiency (km/L)</Label>
              <Input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                placeholder="Enter mileage..."
              />
            </div>
            <div className="space-y-2">
              <Label>Fuel Price (BDT/L)</Label>
              <Input
                type="number"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(Number(e.target.value))}
                placeholder="Enter fuel price..."
              />
            </div>
          </div>

          <div className="bg-muted/30 p-6 rounded-xl flex flex-col justify-center space-y-6 text-center md:text-left">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Estimated Fuel Cost
              </p>
              <p className="text-4xl font-bold text-primary">
                {fuelCost.toLocaleString()} ৳
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Based on current fuel price and your bike&apos;s mileage.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
