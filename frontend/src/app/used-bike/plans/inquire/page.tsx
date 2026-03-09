"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, ShieldCheck, Send, AlertCircle, ArrowLeft, Star, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

function PlanInquiryForm() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    plan: "silver",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (planParam) {
      const planValue = planParam.toLowerCase().includes("gold") ? "gold" : "silver";
      setFormData(prev => ({ ...prev, plan: planValue }));
    }
  }, [planParam]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlanChange = (value: string) => {
    setFormData({ ...formData, plan: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      toast.success("Upgrade request received! We'll guide you through the payment process. (Demo Mode)");
      setFormData({ name: "", email: "", phone: "", plan: "silver", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
      <div className="space-y-8">
        <h3 className="text-2xl font-bold tracking-tight">What happens next?</h3>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold">1</div>
            <div>
              <p className="font-semibold">Request Received</p>
              <p className="text-sm text-muted-foreground">Our team confirms your account details and selected plan.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold">2</div>
            <div>
              <p className="font-semibold">Payment Link</p>
              <p className="text-sm text-muted-foreground">We send you a secure bKash or Nagad payment link via email/phone.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold">3</div>
            <div>
              <p className="font-semibold">Account Upgraded</p>
              <p className="text-sm text-muted-foreground">Your listings get instant featured status once payment is confirmed.</p>
            </div>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-primary fill-primary" />
                Premium Guarantee
              </p>
              <p className="text-xs text-muted-foreground">
                Sell your bike within 15 days or get an additional month of featured listing for free.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="lg:col-span-2">
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 mb-2">
              <CardTitle>Plan Inquiry</CardTitle>
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                <AlertCircle className="h-3 w-3 mr-1" />
                Demo Mode
              </Badge>
            </div>
            <CardDescription>
              Select your plan and provide your contact details to start the upgrade process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="plan">Selected Tier</Label>
                  <Select
                    onValueChange={handlePlanChange}
                    value={formData.plan}
                  >
                    <SelectTrigger id="plan">
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="silver">
                        <div className="flex items-center gap-2">
                          <Zap className="h-3.5 w-3.5 text-primary" />
                          Silver Tier (৳499)
                        </div>
                      </SelectItem>
                      <SelectItem value="gold">
                        <div className="flex items-center gap-2">
                          <Star className="h-3.5 w-3.5 text-primary" />
                          Gold Tier (৳999)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Full Name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="01XXXXXXXXX"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Additional Notes (Optional)</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Any specific requests?"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                <Send className="mr-2 h-4 w-4" />{" "}
                {isSubmitting ? "Submitting..." : "Initialize Upgrade"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PlanInquiryPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/30 border-b overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <ShieldCheck size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-10 relative z-10">
          <div className="max-w-6xl mx-auto">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/used-bike/plans">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tiers
              </Link>
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Upgrade <span className="text-primary">Request</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 py-12">
        <Suspense fallback={<div className="text-center py-20">Loading form...</div>}>
          <PlanInquiryForm />
        </Suspense>
      </div>
    </div>
  );
}
