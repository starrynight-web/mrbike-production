"use client";

import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText, Info, CheckCircle2, HelpCircle, Zap } from "lucide-react";
import { api } from "@/lib/api-service";

type PublicConfig = Record<string, string>;
type LicenseFeeRow = { type: string; base: string | number; vat: string | number; total: string | number };
type SmartcardFeeRow = { item: string; fee: string | number; vat: string | number; total: string | number };
type RegistrationFeeRow = { cc: string; period: string; fee: string };
type FAQItem = { q: string; a: string };

function parseList<T>(value: string): T[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export default function BikeRegistrationPage() {
  const [cc, setCc] = useState("100");
  const [duration, setDuration] = useState("2");
  const [fee, setFee] = useState<number | null>(null);
  const [config, setConfig] = useState<PublicConfig | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.getPublicConfig();
        if (res.success) setConfig((res.data as PublicConfig | undefined) ?? null);
      } catch (e) {
        console.error("Failed to load registration config:", e);
      }
    }
    loadConfig();
  }, []);

  // Parse JSON data
  const licenseFees = parseList<LicenseFeeRow>(config?.cms_bike_reg_license_fees || "[]");
  const steps = parseList<string>(config?.cms_bike_reg_steps || "[]");
  const smartcardFees = parseList<SmartcardFeeRow>(config?.cms_bike_reg_smartcard_fees || "[]");
  const regFees = parseList<RegistrationFeeRow>(config?.cms_bike_reg_reg_fees || "[]");
  const docsLicense = parseList<string>(config?.cms_bike_reg_docs_license || "[]");
  const docsReg = parseList<string>(config?.cms_bike_reg_docs_registration || "[]");
  const faqs = parseList<FAQItem>(config?.cms_bike_reg_faqs || "[]");

  const calculateFee = () => {
    const ccType = cc === "100" ? "Up to 100cc" : "Over 100cc";
    const periodType = duration === "2" ? "2 Years" : "10 Years";
    
    const match = regFees.find((f) => 
      f.cc.toLowerCase().includes(ccType.toLowerCase()) && 
      f.period.toLowerCase().includes(periodType.toLowerCase())
    );

    if (match) {
      // Extract numeric value from "10,664 BDT" style strings
      const numericFee = parseInt(match.fee.replace(/[^0-9]/g, ""));
      setFee(numericFee);
    } else {
      // Fallback to legacy logic if CMS table is empty or doesn't match
      const ccValue = parseInt(cc);
      const durationValue = parseInt(duration);
      if (ccValue <= 100 && durationValue === 2) setFee(10664);
      else if (ccValue <= 100 && durationValue === 10) setFee(11764);
      else if (ccValue > 100 && durationValue === 2) setFee(19664);
      else if (ccValue > 100 && durationValue === 10) setFee(20964);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/50 border-b relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <FileText size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-16 md:py-20 relative z-10">
          <div className="max-w-4xl space-y-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 px-4 py-1">
              Citizen Services
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Registration & <span className="text-primary block md:inline">License Guide</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Complete guide to motorcycle registration, driving license
              process, fees, and necessary documents in Bangladesh.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 mt-12 max-w-6xl mx-auto">
        {(config?.cms_bike_registration_content && config.cms_bike_registration_content !== "<p></p>") && (
          <Card className="mb-12 overflow-hidden">
            <CardContent className="p-8 md:p-12 prose prose-lg dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: config.cms_bike_registration_content }} />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="w-full px-4 md:px-8 max-w-7xl mx-auto space-y-16">
        {/* Section 1: Driving License Fees */}
        {licenseFees.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-primary/20 pb-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl border-2 border-primary/20 shadow-sm">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Driving License Fees</h2>
                  <p className="text-muted-foreground text-sm">Updated BRTA Fee Structure</p>
                </div>
              </div>
              <Badge variant="secondary" className="px-4 py-1.5 rounded-full font-bold">15% VAT Included</Badge>
            </div>
            
            <Card className="overflow-hidden">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-base text-center">
                  <thead className="bg-muted/50 border-b-2">
                    <tr className="transition-colors hover:bg-muted/50">
                      <th className="h-16 px-6 align-middle font-black text-muted-foreground uppercase tracking-[0.2em] text-xs">#</th>
                      <th className="h-16 px-6 align-middle font-black text-foreground uppercase tracking-[0.1em] text-sm text-left">License Type</th>
                      <th className="h-16 px-6 align-middle font-black text-muted-foreground uppercase tracking-widest text-xs">Base Fee</th>
                      <th className="h-16 px-6 align-middle font-black text-muted-foreground uppercase tracking-widest text-xs">VAT 15%</th>
                      <th className="h-16 px-6 align-middle font-black text-primary uppercase tracking-[0.1em] text-sm">Total Pay</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {licenseFees.map((row, idx) => (
                      <tr key={idx} className="border-b transition-colors hover:bg-muted/30 group">
                        <td className="p-6 align-middle text-muted-foreground font-mono text-xs opacity-50">{String(idx + 1).padStart(2, "0")}</td>
                        <td className="p-6 align-middle text-left font-bold text-lg">{row.type}</td>
                        <td className="p-6 align-middle font-mono font-medium">{row.base}</td>
                        <td className="p-6 align-middle font-mono text-muted-foreground">{row.vat}</td>
                        <td className="p-6 align-middle font-black text-primary font-mono text-xl group-hover:scale-110 transition-transform">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        )}

        <div className="grid lg:grid-cols-2 gap-16">
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-primary/20 pb-4">
              <div className="bg-primary/10 p-3 rounded-2xl border-2 border-primary/20 shadow-sm">
                <Info className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Step-by-Step Process</h2>
            </div>
            <div className="space-y-4 relative">
              <div className="absolute left-7 top-4 bottom-4 w-1 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent rounded-full" />
              {steps.map((step: string, i: number) => (
                <div key={i} className="flex gap-4 items-center p-5 rounded-xl border bg-card group relative z-10">
                  <span className="h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-lg">
                    {i + 1}
                  </span>
                  <p className="text-base font-semibold leading-tight">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-16">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight border-b border-primary/20 pb-4">
                RFID Plate & Smart Card
              </h2>
              <Card className="overflow-hidden">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-base text-center">
                    <thead className="bg-muted/50 border-b-2">
                      <tr className="border-b">
                        <th className="h-14 px-6 align-middle font-black text-foreground uppercase tracking-wider text-xs text-left">Item Name</th>
                        <th className="h-14 px-6 align-middle font-black text-muted-foreground uppercase tracking-widest text-xs">Fee</th>
                        <th className="h-14 px-6 align-middle font-black text-muted-foreground uppercase tracking-widest text-xs">VAT</th>
                        <th className="h-14 px-6 align-middle font-black text-primary uppercase tracking-wider text-xs">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {smartcardFees.map((row, i) => (
                        <tr key={i} className="border-b transition-colors hover:bg-muted/30">
                          <td className="p-6 align-middle text-left font-bold">{row.item}</td>
                          <td className="p-6 align-middle font-mono font-medium">{row.fee}</td>
                          <td className="p-6 align-middle font-mono text-muted-foreground">{row.vat}</td>
                          <td className="p-6 align-middle font-black text-primary font-mono">{row.total}</td>
                        </tr>
                      ))}
                      {smartcardFees.length > 0 && (
                        <tr className="bg-primary/5 font-black">
                          <td colSpan={3} className="p-6 align-middle text-left uppercase tracking-tight text-sm">Combined Total</td>
                          <td className="p-6 align-middle text-primary text-2xl italic">
                            2,815 BDT
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight border-b border-primary/20 pb-4">
                Registration Overview
              </h2>
              <Card className="overflow-hidden">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-base text-center">
                    <thead className="bg-muted/50 border-b-2">
                      <tr className="border-b">
                        <th className="h-14 px-6 align-middle font-black text-foreground uppercase tracking-wider text-xs text-left">Capacity</th>
                        <th className="h-14 px-6 align-middle font-black text-muted-foreground uppercase tracking-widest text-xs">Years</th>
                        <th className="h-14 px-6 align-middle font-black text-primary uppercase tracking-wider text-xs">Final Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regFees.map((row, i) => (
                        <tr key={i} className="border-b transition-colors hover:bg-muted/30">
                          <td className="p-6 align-middle text-left font-bold">{row.cc}</td>
                          <td className="p-6 align-middle font-bold text-muted-foreground">{row.period}</td>
                          <td className="p-6 align-middle font-black text-primary font-mono text-xl">{row.fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          </div>
        </div>

        <section className="scroll-mt-20 max-w-5xl mx-auto w-full" id="calculator">
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-5 h-full">
              <div className="md:col-span-2 bg-primary p-8 text-primary-foreground flex flex-col justify-center space-y-4">
                <Zap className="h-10 w-10 mb-2 opacity-60" />
                <h3 className="text-2xl font-bold leading-tight">Registration Fee Calculator</h3>
                <p className="text-primary-foreground/80 leading-relaxed">
                  Calculate your official BDT fees instantly based on the latest 2024 BRTA data.
                </p>
              </div>
              <CardContent className="md:col-span-3 p-8 space-y-8 bg-background">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label>Engine Capacity (CC)</Label>
                    <Select value={cc} onValueChange={setCc}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">Up to 100cc</SelectItem>
                        <SelectItem value="101">Over 100cc (110-165cc)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Registration Duration</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Years (Minimum)</SelectItem>
                        <SelectItem value="10">10 Years (Lifetime)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full h-12"
                  onClick={calculateFee}
                >
                  Calculate Fee ৳
                </Button>

                {fee !== null && (
                  <div className="bg-primary/5 border border-primary/20 p-8 rounded-xl text-center">
                    <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Official Estimate</p>
                    <p className="text-5xl font-bold text-primary tracking-tight">
                      ৳{fee.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground mt-2 text-xs">
                      Including 15% VAT & Stamp Duties
                    </p>
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        </section>

        <div className="grid lg:grid-cols-2 gap-16">
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-primary/20 pb-4">
              <div className="bg-primary/10 p-3 rounded-2xl border-2 border-primary/20 shadow-sm">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Required Documents</h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="license" className="border rounded-xl px-4 bg-card overflow-hidden">
                <AccordionTrigger className="hover:no-underline py-4 font-semibold text-lg group">
                  <span className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-primary" /> Driving License Pack
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {docsLicense.map((doc: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 text-sm border border-transparent">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        {doc}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="registration" className="border rounded-xl px-4 bg-card overflow-hidden">
                <AccordionTrigger className="hover:no-underline py-4 font-semibold text-lg group">
                  <span className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary" /> Bike Registration Pack
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {docsReg.map((doc: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 text-sm border border-transparent">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        {doc}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-primary/20 pb-4">
              <div className="bg-primary/10 p-3 rounded-2xl border-2 border-primary/20 shadow-sm">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Registration FAQs</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <Card key={i} className="p-6 rounded-xl border bg-card">
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-3">
                    <span className="h-1.5 w-6 bg-primary rounded-full group-hover:w-8 transition-all" />
                    {faq.q}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed pl-9">
                    {faq.a}
                  </p>
                </Card>
              ))}
              {faqs.length === 0 && (
                 <div className="text-center py-12 opacity-50 font-bold uppercase tracking-widest italic">No specific FAQs loaded</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
