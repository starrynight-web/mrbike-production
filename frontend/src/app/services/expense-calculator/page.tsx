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

export default function ExpenseCalculatorPage() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.getPublicConfig();
        if (res.success) setConfig(res.data);
      } catch (e) {
        console.error("Failed to load calculator config:", e);
      }
    }
    loadConfig();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero Header */}
      <div className="bg-muted/30 border-b relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <Calculator size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-20 relative z-10">
          <div className="max-w-4xl space-y-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest">
              Financial Tools
            </Badge>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight uppercase italic leading-[1]">
               Smart <span className="text-primary">Expense Panel</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
              Quickly estimate your bike-related expenses including monthly EMI
              and your fuel cost per trip with precision.
            </p>
          </div>
        </div>
      </div>

      {/* CMS Rich Content Section */}
      <div className="w-full px-4 md:px-8 mt-12 max-w-5xl mx-auto">
        {(config?.cms_expense_calculator_content && config.cms_expense_calculator_content !== "<p></p>") && (
          <Card className="border-2 mb-16 shadow-xl rounded-[2.5rem] overflow-hidden bg-primary/5 border-primary/10">
            <CardContent className="p-8 md:p-12 prose prose-lg dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: config.cms_expense_calculator_content }} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Interactive Tabs Section */}
      <div className="w-full px-4 md:px-8 max-w-6xl mx-auto space-y-12">
        <Tabs defaultValue="emi" className="w-full">
          <TabsList className="grid w-full grid-cols-2 p-2 h-20 bg-muted/30 rounded-[2rem] border-2">
            <TabsTrigger value="emi" className="rounded-[1.5rem] text-lg font-black uppercase italic tracking-wider py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
              <Calculator className="h-5 w-5 mr-3" /> EMI Calculator
            </TabsTrigger>
            <TabsTrigger value="fuel" className="rounded-[1.5rem] text-lg font-black uppercase italic tracking-wider py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
              <Fuel className="h-5 w-5 mr-3" /> Octane Cost
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emi" className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EMICalculator />
          </TabsContent>

          <TabsContent value="fuel" className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
    <Card className="border-4 border-primary/10 shadow-2xl rounded-[3.5rem] overflow-hidden">
      <CardHeader className="p-10 md:p-14 border-b bg-muted/20">
        <div className="flex items-center gap-4 mb-4">
           <Badge className="bg-primary/20 text-primary border-primary/30 uppercase font-black px-4 py-1">Financing</Badge>
        </div>
        <CardTitle className="text-3xl md:text-5xl font-black uppercase italic tracking-tight">Bike Loan <span className="text-primary italic">Calculator</span></CardTitle>
        <CardDescription className="text-xl font-medium">
          Plan your bike purchase with detailed BDT breakdowns and interest projections.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-10 md:p-14 space-y-12">
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="space-y-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Bike Price (BDT)</Label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-4 flex items-center text-primary font-black">৳</div>
                   <Input
                    type="number"
                    value={bikePrice}
                    className="h-16 pl-10 rounded-2xl border-2 text-xl font-black bg-muted/20 focus-visible:ring-primary"
                    onChange={(e) => setBikePrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Down Payment (BDT)</Label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-4 flex items-center text-primary font-black">৳</div>
                   <Input
                    type="number"
                    value={downPayment}
                    className="h-16 pl-10 rounded-2xl border-2 text-xl font-black bg-muted/20 focus-visible:ring-primary"
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 p-8 rounded-3xl bg-muted/30 border-2">
              <div className="flex justify-between items-end mb-4">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Interest Rate</Label>
                <span className="text-4xl font-black italic text-primary">{interestRate}% <span className="text-xs uppercase font-bold text-muted-foreground not-italic">p.a.</span></span>
              </div>
              <Slider
                value={[interestRate]}
                min={1}
                max={30}
                step={0.5}
                className="py-4"
                onValueChange={(vals) => setInterestRate(vals[0])}
              />
            </div>

            <div className="space-y-6 p-8 rounded-3xl bg-muted/30 border-2">
              <div className="flex justify-between items-end mb-4">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Loan Term</Label>
                <span className="text-4xl font-black italic text-primary">{term} <span className="text-xs uppercase font-bold text-muted-foreground not-italic">Months</span></span>
              </div>
              <Slider
                value={[term]}
                min={3}
                max={120}
                step={1}
                className="py-4"
                onValueChange={(vals) => setTerm(vals[0])}
              />
            </div>
          </div>

          <div className="flex flex-col justify-between gap-8 h-full">
            <div className="bg-primary p-12 rounded-[3.5rem] shadow-2xl shadow-primary/30 text-primary-foreground space-y-4 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <TrendingUp size={120} />
               </div>
               <p className="text-xs uppercase font-black tracking-[0.4em] opacity-80">Estimated Monthly EMI</p>
               <p className="text-7xl md:text-8xl font-black tracking-tighter leading-none italic">
                ৳{emi.toLocaleString()}
               </p>
               <div className="flex items-center gap-2 pt-4 opacity-70">
                  <Badge variant="outline" className="text-white border-white/30 uppercase font-black px-3">Fixed Rate</Badge>
                  <span className="text-sm font-bold italic">Calculated Instantly</span>
               </div>
            </div>

            <div className="grid gap-6">
               <div className="bg-muted/50 p-8 rounded-[2.5rem] border-2 flex items-center justify-between group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-primary" />
                     </div>
                     <div>
                        <p className="text-xs uppercase font-black tracking-widest text-muted-foreground mb-1">Total Payable</p>
                        <p className="text-2xl font-black italic">৳{totalPayment.toLocaleString()}</p>
                     </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:translate-x-2 transition-transform" />
               </div>

               <div className="bg-muted/50 p-8 rounded-[2.5rem] border-2 flex items-center justify-between group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-primary" />
                     </div>
                     <div>
                        <p className="text-xs uppercase font-black tracking-widest text-muted-foreground mb-1">Principal Amount</p>
                        <p className="text-2xl font-black italic">৳{principal.toLocaleString()}</p>
                     </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:translate-x-2 transition-transform" />
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
    <Card className="border-4 border-primary/10 shadow-2xl rounded-[3.5rem] overflow-hidden">
      <CardHeader className="p-10 md:p-14 border-b bg-muted/20">
        <div className="flex items-center gap-4 mb-4">
           <Badge className="bg-primary/20 text-primary border-primary/30 uppercase font-black px-4 py-1">Efficiency</Badge>
        </div>
        <CardTitle className="text-3xl md:text-5xl font-black uppercase italic tracking-tight">Octane <span className="text-primary italic">Estimator</span></CardTitle>
        <CardDescription className="text-xl font-medium">
          Calculate your travel expenses based on real-world mileage and current fuel rates.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-10 md:p-14 space-y-12">
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-4">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Trip Distance</Label>
                <span className="text-4xl font-black italic text-primary">{distance} <span className="text-xs uppercase font-bold text-muted-foreground not-italic">km</span></span>
              </div>
              <Slider
                value={[distance]}
                min={1}
                max={500}
                step={1}
                className="py-4"
                onValueChange={(vals) => setDistance(vals[0])}
              />
              <Input
                type="number"
                value={distance}
                className="h-14 rounded-2xl border-2 text-lg font-bold bg-muted/10 text-center"
                onChange={(e) => setDistance(Number(e.target.value))}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end mb-4">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Bike Mileage</Label>
                <span className="text-4xl font-black italic text-primary">{mileage} <span className="text-xs uppercase font-bold text-muted-foreground not-italic">km/L</span></span>
              </div>
              <Slider
                value={[mileage]}
                min={5}
                max={100}
                step={1}
                className="py-4"
                onValueChange={(vals) => setMileage(vals[0])}
              />
              <Input
                type="number"
                value={mileage}
                className="h-14 rounded-2xl border-2 text-lg font-bold bg-muted/10 text-center"
                onChange={(e) => setMileage(Number(e.target.value))}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1 px-1">Current Fuel Price (Tk / Liter)</Label>
              <Input
                type="number"
                value={fuelPrice}
                className="h-16 rounded-2xl border-2 text-2xl font-black text-center bg-muted/20 focus-visible:ring-primary"
                onChange={(e) => setFuelPrice(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="bg-primary p-16 rounded-[4rem] shadow-2xl shadow-primary/30 text-primary-foreground text-center space-y-6 relative overflow-hidden group hover:scale-[1.02] transition-all">
               <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
               <Fuel className="h-20 w-20 mx-auto mb-4 opacity-50 animate-bounce" />
               <p className="text-sm uppercase font-black tracking-[0.5em] opacity-80">Estimated Fuel Cost</p>
               <p className="text-8xl md:text-9xl font-black tracking-tighter italic">
                ৳{fuelCost.toLocaleString()}
               </p>
               <p className="text-lg font-medium opacity-70 italic">
                  Based on {distance}km @ {mileage}km/L
               </p>
            </div>
            
            <div className="mt-12 p-8 border-2 border-dashed border-primary/20 rounded-[2.5rem] bg-primary/5">
                <p className="text-muted-foreground font-medium italic text-center">
                  Tip: Clean your air filter and maintain proper tire pressure to achieve optimal mileage on your motorcycle.
                </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
