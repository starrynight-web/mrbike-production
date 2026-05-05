"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Calculator, Fuel, Zap, TrendingUp, Wallet, ArrowRight } from "lucide-react";
import { api } from "@/lib/api-service";

type PublicConfig = Record<string, string>;

export default function ExpenseCalculatorPage() {
  const [config, setConfig] = useState<PublicConfig | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.getPublicConfig();
        if (res.success) setConfig((res.data as PublicConfig | undefined) ?? null);
      } catch (e) {
        console.error("Failed to load calculator config:", e);
      }
    }
    loadConfig();
  }, []);

  const heroTitle = config?.cms_expense_calculator_title || "Motorcycle Expense Calculator";
  const heroSubtitle =
    config?.cms_expense_calculator_subtitle ||
    "Track your monthly biking costs with easy calculators for EMI and fuel.";

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/50 border-b relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <Calculator size={400} />
        </div>
        <div className="container py-12 relative z-10">
          <div className="max-w-4xl space-y-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 px-4 py-1">
              Financial Tools
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {heroTitle}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {heroSubtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12 max-w-4xl mx-auto">
        {(config?.cms_expense_calculator_content && config.cms_expense_calculator_content !== "<p></p>") && (
          <Card className="mb-8 overflow-hidden bg-primary/5 border-primary/10">
            <CardContent className="p-8 prose prose-lg dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: config.cms_expense_calculator_content }} />
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="emi" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="emi" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" /> EMI Calculator
            </TabsTrigger>
            <TabsTrigger value="fuel" className="flex items-center gap-2">
              <Fuel className="h-4 w-4" /> Fuel Cost
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emi" className="mt-8">
            <EMICalculator />
          </TabsContent>

          <TabsContent value="fuel" className="mt-8">
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

  const principal = Math.max(0, bikePrice - downPayment);
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
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-center gap-3 mb-2">
           <Badge className="bg-primary/10 text-primary border-primary/20">Financing</Badge>
        </div>
        <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">Bike Loan <span className="text-primary">Calculator</span></CardTitle>
        <CardDescription>
          Plan your bike purchase with detailed BDT breakdowns and interest projections.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Bike Price (BDT)</Label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-3 flex items-center text-primary font-semibold">৳</div>
                   <Input
                     type="number"
                     value={bikePrice}
                     className="h-11 pl-8"
                     onChange={(e) => setBikePrice(Number(e.target.value))}
                   />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Down Payment (BDT)</Label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-3 flex items-center text-primary font-semibold">৳</div>
                   <Input
                     type="number"
                     value={downPayment}
                     className="h-11 pl-8"
                     onChange={(e) => setDownPayment(Number(e.target.value))}
                   />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-muted/30 border">
              <div className="flex justify-between items-center">
                <Label>Interest Rate</Label>
                <span className="text-2xl font-bold text-primary">{interestRate}%</span>
              </div>
              <Slider
                value={[interestRate]}
                min={1}
                max={30}
                step={0.5}
                onValueChange={(vals) => setInterestRate(vals[0])}
              />
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-muted/30 border">
              <div className="flex justify-between items-center">
                <Label>Loan Term</Label>
                <span className="text-2xl font-bold text-primary">{term} Months</span>
              </div>
              <Slider
                value={[term]}
                min={3}
                max={120}
                step={1}
                onValueChange={(vals) => setTerm(vals[0])}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-primary p-8 rounded-xl text-primary-foreground space-y-3 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <TrendingUp size={72} />
               </div>
               <p className="text-xs uppercase tracking-wider opacity-80">Estimated Monthly EMI</p>
               <p className="text-5xl font-bold tracking-tight leading-none">
                 ৳{emi.toLocaleString()}
               </p>
               <div className="flex items-center gap-2 pt-2 opacity-80">
                  <Badge variant="outline" className="text-white border-white/30">Fixed Rate</Badge>
                  <span className="text-sm">Calculated Instantly</span>
               </div>
            </div>

            <div className="grid gap-4">
               <div className="bg-muted/50 p-6 rounded-xl border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-primary" />
                     </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Total Payable</p>
                        <p className="text-2xl font-semibold">৳{totalPayment.toLocaleString()}</p>
                     </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
               </div>

               <div className="bg-muted/50 p-6 rounded-xl border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-primary" />
                     </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Principal Amount</p>
                        <p className="text-2xl font-semibold">৳{principal.toLocaleString()}</p>
                     </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
               </div>
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

  let fuelCost = 0;
  if (distance > 0 && mileage > 0 && fuelPrice > 0) {
    const cost = (distance / mileage) * fuelPrice;
    fuelCost = Math.round(cost);
  }

  return (
    <Card>
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-center gap-3 mb-2">
           <Badge className="bg-primary/10 text-primary border-primary/20">Efficiency</Badge>
        </div>
        <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">Fuel Cost <span className="text-primary">Estimator</span></CardTitle>
        <CardDescription>
          Calculate your travel expenses based on real-world mileage and current fuel rates.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Trip Distance</Label>
                <span className="text-2xl font-bold text-primary">{distance} km</span>
              </div>
              <Slider
                value={[distance]}
                min={1}
                max={500}
                step={1}
                onValueChange={(vals) => setDistance(vals[0])}
              />
              <Input
                type="number"
                value={distance}
                className="h-11"
                onChange={(e) => setDistance(Number(e.target.value))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Bike Mileage</Label>
                <span className="text-2xl font-bold text-primary">{mileage} km/L</span>
              </div>
              <Slider
                value={[mileage]}
                min={5}
                max={100}
                step={1}
                onValueChange={(vals) => setMileage(vals[0])}
              />
              <Input
                type="number"
                value={mileage}
                className="h-11"
                onChange={(e) => setMileage(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Current Fuel Price (Tk / Liter)</Label>
              <Input
                type="number"
                value={fuelPrice}
                className="h-11"
                onChange={(e) => setFuelPrice(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-6 flex flex-col justify-center">
            <div className="bg-primary p-10 rounded-xl text-primary-foreground text-center space-y-4">
               <Fuel className="h-12 w-12 mx-auto opacity-60" />
               <p className="text-sm uppercase tracking-wider opacity-80">Estimated Fuel Cost</p>
               <p className="text-6xl font-bold tracking-tight">
                ৳{fuelCost.toLocaleString()}
               </p>
               <p className="text-sm opacity-80">
                  Based on {distance}km @ {mileage}km/L
               </p>
             </div>
            
            <div className="p-6 border border-dashed border-primary/20 rounded-xl bg-primary/5">
                <p className="text-muted-foreground text-center">
                   Tip: Clean your air filter and maintain proper tire pressure to achieve optimal mileage on your motorcycle.
                </p>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
