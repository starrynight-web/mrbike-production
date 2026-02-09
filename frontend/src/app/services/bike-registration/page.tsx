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
    <div className="container py-10 max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Motorcycle Registration & License Guide
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Whether you&apos;re planning to register a new motorcycle or apply for
          a driving license in Bangladesh, understanding the process, necessary
          documents, and costs is crucial. Here&apos;s a full breakdown to guide
          you through the latest steps, fees, and tips.
        </p>
      </div>

      {/* Section 1: Driving License Fees */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" /> Driving License Fees
        </h2>
        <Card>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-center">
              <thead className="[&_tr]:border-b bg-muted/50">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                    #
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-left">
                    License Type
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                    Base Fee (BDT)
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                    VAT 15%
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground font-bold">
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
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">{row.id}</td>
                    <td className="p-4 align-middle text-left font-medium">
                      {row.type}
                    </td>
                    <td className="p-4 align-middle">{row.base}</td>
                    <td className="p-4 align-middle">{row.vat}</td>
                    <td className="p-4 align-middle font-bold text-primary">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Section 2: Application Process */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Info className="h-6 w-6 text-primary" /> Application Process
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            "Collect assessment slip",
            "Fee Deposit: Visit bank with slip & mobile number",
            "Submit money receipt & documents to BRTA",
            "Receive SMS for biometric submission",
            "Submit biometrics on date",
            "Receive SMS for RFID plate & Smart Card",
            "Collect card & plate",
          ].map((step, i) => (
            <Card key={i} className="bg-muted/30 border-none">
              <CardContent className="pt-6 flex gap-4 items-start">
                <Badge className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm">
                  {i + 1}
                </Badge>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                  {step}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 3: Smart Card Fees */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Smart Card & RFID Plate Fees</h2>
        <Card>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-center">
              <thead className="[&_tr]:border-b bg-muted/50">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-left">
                    Item
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                    Fee (BDT)
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                    VAT 15%
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground font-bold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle text-left">Smart Card</td>
                  <td className="p-4 align-middle">2200</td>
                  <td className="p-4 align-middle">330</td>
                  <td className="p-4 align-middle">2530</td>
                </tr>
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle text-left">RFID Plate</td>
                  <td className="p-4 align-middle">540</td>
                  <td className="p-4 align-middle">81</td>
                  <td className="p-4 align-middle">621</td>
                </tr>
                <tr className="bg-primary/5 font-bold">
                  <td className="p-4 align-middle text-left">Total</td>
                  <td className="p-4 align-middle text-muted-foreground">-</td>
                  <td className="p-4 align-middle text-muted-foreground">-</td>
                  <td className="p-4 align-middle text-primary">2815 BDT</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Section 4: Registration Fees */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Motorcycle Registration Fees</h2>
        <Card>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-center">
              <thead className="[&_tr]:border-b bg-muted/50">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-left">
                    Engine CC
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                    Period
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground font-bold">
                    Registration Fee
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle text-left">Up to 100cc</td>
                  <td className="p-4 align-middle">2 Years</td>
                  <td className="p-4 align-middle font-bold">10,664 BDT</td>
                </tr>
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle text-left">Over 100cc</td>
                  <td className="p-4 align-middle">2 Years</td>
                  <td className="p-4 align-middle font-bold">19,664 BDT</td>
                </tr>
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle text-left">Up to 100cc</td>
                  <td className="p-4 align-middle">10 Years</td>
                  <td className="p-4 align-middle font-bold">11,764 BDT</td>
                </tr>
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle text-left">Over 100cc</td>
                  <td className="p-4 align-middle">10 Years</td>
                  <td className="p-4 align-middle font-bold">20,964 BDT</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Calculator Section */}
      <section className="scroll-mt-20" id="calculator">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-muted/30 pb-8">
            <CardTitle>Registration Fee Calculator</CardTitle>
            <CardDescription>
              Calculate your registration fee based on engine capacity and
              duration.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Engine Capacity (CC)</Label>
                <Select value={cc} onValueChange={setCc}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">Up to 100cc</SelectItem>
                    <SelectItem value="101">Over 100cc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Registration Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Years</SelectItem>
                    <SelectItem value="10">10 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button size="lg" className="w-full text-lg" onClick={calculateFee}>
              Calculate Fee
            </Button>

            {fee !== null && (
              <div className="bg-primary/10 p-6 rounded-xl text-center animate-in fade-in slide-in-from-top-4">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                  Total Registration Fee
                </p>
                <p className="text-4xl font-bold text-primary">
                  {fee.toLocaleString()} BDT
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Documents Required */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" /> Documents Required
        </h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="license">
            <AccordionTrigger>For Driving License</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Birth Certificate</li>
                <li>NID / Voter ID</li>
                <li>Passport (optional)</li>
                <li>School/Educational Certificate</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="registration">
            <AccordionTrigger>For Bike Registration</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Assessment slip</li>
                <li>Money receipt</li>
                <li>Documents provided by dealer</li>
                <li>Tax token</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* FAQs */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="grid gap-4">
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
            {
              q: "What if I don't register my bike?",
              a: "Illegal. You may be fined or lose your bike.",
            },
            {
              q: "How long does registration take?",
              a: "Usually 7–15 days.",
            },
          ].map((faq, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">{faq.q}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {faq.a}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
