"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { CreditCard, FileText, Info } from "lucide-react";

export default function BikeRegistrationPage() {
  const [cc, setCc] = useState("100");
  const [duration, setDuration] = useState("2");
  const [fee, setFee] = useState<number | null>(null);

  const calculateFee = () => {
    const ccValue = parseInt(cc);
    const durationValue = parseInt(duration);
    let calculatedFee = 0;

    if (ccValue <= 100 && durationValue === 2) calculatedFee = 10664;
    else if (ccValue <= 100 && durationValue === 10) calculatedFee = 11764;
    else if (ccValue > 100 && durationValue === 2) calculatedFee = 19664;
    else if (ccValue > 100 && durationValue === 10) calculatedFee = 20964;

    setFee(calculatedFee);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/50 border-b relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <FileText size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-12 relative z-10">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Registration & <span className="text-primary">License</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Complete guide to motorcycle registration, driving license
              process, fees, and necessary documents in Bangladesh.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 py-12 max-w-6xl mx-auto space-y-16">
        {/* Section 1: Driving License Fees */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Driving License Fees</h2>
          </div>
          <Card className="overflow-hidden border-2">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm text-center">
                <thead className="[&_tr]:border-b bg-muted/80">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 align-middle font-semibold text-foreground uppercase tracking-wider text-xs">
                      #
                    </th>
                    <th className="h-12 px-4 align-middle font-semibold text-foreground uppercase tracking-wider text-xs text-left">
                      License Type
                    </th>
                    <th className="h-12 px-4 align-middle font-semibold text-foreground uppercase tracking-wider text-xs">
                      Base Fee (BDT)
                    </th>
                    <th className="h-12 px-4 align-middle font-semibold text-foreground uppercase tracking-wider text-xs">
                      VAT 15%
                    </th>
                    <th className="h-12 px-4 align-middle font-bold text-primary uppercase tracking-wider text-xs">
                      Total (BDT)
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {[
                    {
                      id: 1,
                      type: "শিক্ষানবিশ এক শ্রেণী",
                      base: 300,
                      vat: 45,
                      total: 345,
                    },
                    {
                      id: 2,
                      type: "শিক্ষানবিশ দুই শ্রেণী",
                      base: 450,
                      vat: 68,
                      total: 518,
                    },
                    {
                      id: 3,
                      type: "শিক্ষানবিশ নবায়ন (৩ মাস)",
                      base: 75,
                      vat: 12,
                      total: 87,
                    },
                    {
                      id: 4,
                      type: "শিক্ষানবিশ নবায়ন (৬ মাস)",
                      base: 150,
                      vat: 23,
                      total: 173,
                    },
                    {
                      id: 5,
                      type: "অপেশাদার (ইস্যু)",
                      base: 2210,
                      vat: 332,
                      total: 2542,
                    },
                    {
                      id: 6,
                      type: "পেশাদার (ইস্যু)",
                      base: 1460,
                      vat: 219,
                      total: 1679,
                    },
                    {
                      id: 7,
                      type: "অপেশাদার (নবায়ন)",
                      base: 2110,
                      vat: 317,
                      total: 2427,
                    },
                    {
                      id: 8,
                      type: "পেশাদার (নবায়ন)",
                      base: 1360,
                      vat: 204,
                      total: 1564,
                    },
                    {
                      id: 9,
                      type: "পেশাদার নবায়ন পরীক্ষা",
                      base: 150,
                      vat: 23,
                      total: 173,
                    },
                    {
                      id: 10,
                      type: "নবায়ন জরিমানা (প্রতি বছর)",
                      base: 200,
                      vat: 30,
                      total: 230,
                    },
                    {
                      id: 11,
                      type: "ড্রাইভিং লাইসেন্স প্রতিলিপি",
                      base: 760,
                      vat: 114,
                      total: 874,
                    },
                    {
                      id: 12,
                      type: "ড্রাইভিং লাইসেন্স সংশোধনী",
                      base: 810,
                      vat: 122,
                      total: 932,
                    },
                    {
                      id: 13,
                      type: "শুধু অন্তর্ভুক্তি",
                      base: 200,
                      vat: 0,
                      total: 200,
                    },
                    {
                      id: 14,
                      type: "অন্তর্ভুক্তি ও প্রতিলিপি সহ",
                      base: 960,
                      vat: 144,
                      total: 1104,
                    },
                    {
                      id: 15,
                      type: "ড্রাইভিং লাইসেন্স সত্যায়িত",
                      base: 120,
                      vat: -12,
                      total: 108,
                    },
                  ].map((row) => (
                    <tr
                      key={row.id}
                      className="border-b transition-colors hover:bg-muted/30"
                    >
                      <td className="p-4 align-middle text-muted-foreground font-mono text-xs">
                        {String(row.id).padStart(2, "0")}
                      </td>
                      <td className="p-4 align-middle text-left font-medium">
                        {row.type}
                      </td>
                      <td className="p-4 align-middle font-mono">{row.base}</td>
                      <td className="p-4 align-middle font-mono text-muted-foreground">
                        {row.vat}
                      </td>
                      <td className="p-4 align-middle font-bold text-primary font-mono">
                        {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Section 2: Application Process */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Application Process</h2>
            </div>
            <div className="space-y-4">
              {[
                "Collect assessment slip",
                "Fee Deposit: Visit bank with slip & mobile number",
                "Submit money receipt & documents to BRTA",
                "Receive SMS for biometric submission",
                "Submit biometrics on date",
                "Receive SMS for RFID plate & Smart Card",
                "Collect card & plate",
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-center p-4 rounded-xl border bg-card/50 hover:bg-accent/50 transition-colors"
                >
                  <span className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-sm">
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-12">
            {/* Section 3: Smart Card Fees */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold border-b pb-4">
                Smart Card & RFID Plate Fees
              </h2>
              <Card className="border-2">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm text-center">
                    <thead className="[&_tr]:border-b bg-muted/80">
                      <tr className="border-b">
                        <th className="h-12 px-4 align-middle font-semibold text-foreground uppercase tracking-wider text-xs text-left">
                          Item
                        </th>
                        <th className="h-12 px-4 align-middle font-semibold text-foreground uppercase tracking-wider text-xs">
                          Fee (BDT)
                        </th>
                        <th className="h-12 px-4 align-middle font-semibold text-foreground uppercase tracking-wider text-xs">
                          VAT 15%
                        </th>
                        <th className="h-12 px-4 align-middle font-bold text-primary uppercase tracking-wider text-xs">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b transition-colors hover:bg-muted/30">
                        <td className="p-4 align-middle text-left font-medium">
                          Smart Card
                        </td>
                        <td className="p-4 align-middle font-mono">2200</td>
                        <td className="p-4 align-middle font-mono">330</td>
                        <td className="p-4 align-middle font-mono">2530</td>
                      </tr>
                      <tr className="border-b transition-colors hover:bg-muted/30">
                        <td className="p-4 align-middle text-left font-medium">
                          RFID Plate
                        </td>
                        <td className="p-4 align-middle font-mono">540</td>
                        <td className="p-4 align-middle font-mono">81</td>
                        <td className="p-4 align-middle font-mono">621</td>
                      </tr>
                      <tr className="bg-primary/5 font-bold">
                        <td className="p-4 align-middle text-left uppercase tracking-tight">
                          Total Amount
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">
                          -
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">
                          -
                        </td>
                        <td className="p-4 align-middle text-primary text-lg">
                          2815 BDT
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>

            {/* Section 4: Registration Fees */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold border-b pb-4">
                Motorcycle Registration Fees
              </h2>
              <Card className="border-2">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm text-center">
                    <thead className="[&_tr]:border-b bg-muted/80">
                      <tr className="border-b">
                        <th className="h-12 px-4 align-middle font-semibold text-foreground uppercase tracking-wider text-xs text-left">
                          Engine CC
                        </th>
                        <th className="h-12 px-4 align-middle font-semibold text-foreground uppercase tracking-wider text-xs">
                          Period
                        </th>
                        <th className="h-12 px-4 align-middle font-bold text-primary uppercase tracking-wider text-xs">
                          Registration Fee
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { cc: "Up to 100cc", period: "2 Years", fee: "10,664" },
                        { cc: "Over 100cc", period: "2 Years", fee: "19,664" },
                        {
                          cc: "Up to 100cc",
                          period: "10 Years",
                          fee: "11,764",
                        },
                        { cc: "Over 100cc", period: "10 Years", fee: "20,964" },
                      ].map((row, i) => (
                        <tr
                          key={i}
                          className="border-b transition-colors hover:bg-muted/30"
                        >
                          <td className="p-4 align-middle text-left font-medium">
                            {row.cc}
                          </td>
                          <td className="p-4 align-middle font-mono">
                            {row.period}
                          </td>
                          <td className="p-4 align-middle font-bold text-primary font-mono">
                            {row.fee} BDT
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          </div>
        </div>

        {/* Calculator Section */}
        <section
          className="scroll-mt-20 max-w-4xl mx-auto w-full"
          id="calculator"
        >
          <Card className="border-primary/20 shadow-2xl overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground pb-8">
              <CardTitle className="text-2xl">
                Registration Fee Calculator
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Calculate your registration fee based on engine capacity and
                duration.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Engine Capacity (CC)
                  </Label>
                  <Select value={cc} onValueChange={setCc}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">Up to 100cc</SelectItem>
                      <SelectItem value="101">Over 100cc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Registration Duration
                  </Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Years</SelectItem>
                      <SelectItem value="10">10 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full h-14 text-xl font-bold shadow-lg hover:shadow-xl transition-all"
                onClick={calculateFee}
              >
                Calculate Total Fee
              </Button>

              {fee !== null && (
                <div className="bg-primary/5 border-2 border-primary/20 p-8 rounded-2xl text-center animate-in zoom-in-95 duration-300">
                  <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold mb-3">
                    Estimate Total Registration Fee
                  </p>
                  <p className="text-5xl font-black text-primary">
                    ৳{fee.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground mt-2 font-medium">
                    (Includes VAT and all charges)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Documents Required */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold border-b pb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" /> Documents Required
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem
                value="license"
                className="border rounded-xl px-4 bg-card"
              >
                <AccordionTrigger className="hover:no-underline py-4 font-bold">
                  For Driving License
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Birth Certificate",
                      "NID / Voter ID",
                      "Passport (optional)",
                      "School/Educational Certificate",
                    ].map((doc, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="registration"
                className="border rounded-xl px-4 bg-card"
              >
                <AccordionTrigger className="hover:no-underline py-4 font-bold">
                  For Bike Registration
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Assessment slip",
                      "Money receipt",
                      "Dealer documents",
                      "Tax token",
                    ].map((doc, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* FAQs */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold border-b pb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "Can I register a second-hand bike?",
                  a: "Yes, with ownership transfer form & blue-book.",
                },
                {
                  q: "Can I apply for license online?",
                  a: "Yes, via BRTA portal.",
                },
                {
                  q: "Is insurance mandatory?",
                  a: "Yes, third-party insurance required.",
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors"
                >
                  <h4 className="font-bold text-sm mb-1">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
