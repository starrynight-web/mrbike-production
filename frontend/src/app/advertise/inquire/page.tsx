"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Phone, MapPin, Send, Megaphone, AlertCircle, TrendingUp, ArrowLeft } from "lucide-react";
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

function InquireForm() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    plan: "standard",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (planParam) {
      const planValue = planParam.toLowerCase().includes("premium") ? "premium" : 
                        planParam.toLowerCase().includes("dealer") ? "dealer" : "standard";
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
      toast.success("Inquiry sent! Our advertising team will contact you shortly. (Demo Mode)");
      setFormData({ name: "", email: "", company: "", plan: "standard", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold mb-6 tracking-tight">
            Why Partner with MrBike?
          </h3>
          <div className="space-y-6">
            <Card className="border-none shadow-none bg-transparent">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Targeted Reach</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Connect directly with serious motorcycle buyers and enthusiasts in Bangladesh.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-none bg-transparent">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Megaphone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">High Engagement</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Our users spent 5+ minutes on average exploring bike specs and news.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-none bg-transparent p-4 bg-muted/30 rounded-xl border-dashed border-2">
              <div className="flex flex-col gap-3">
                <h4 className="font-bold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Ads Department
                </h4>
                <p className="text-sm text-muted-foreground">
                  For immediate assistance or custom proposals:
                  <br />
                  <strong className="text-foreground">ads@mrbikebd.com</strong>
                  <br />
                  <strong className="text-foreground">+880 1712 000 000</strong>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 mb-2">
              <CardTitle>Advertisement Inquiry</CardTitle>
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                <AlertCircle className="h-3 w-3 mr-1" />
                Demo Mode
              </Badge>
            </div>
            <CardDescription>
              Complete the form below and we&apos;ll get back to you with a tailored campaign plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Contact Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Full Name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company / Brand</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Name of your business"
                    required
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan">Selected Plan</Label>
                  <Select
                    onValueChange={handlePlanChange}
                    value={formData.plan}
                  >
                    <SelectTrigger id="plan">
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Banner (৳5,000)</SelectItem>
                      <SelectItem value="premium">Premium Feature (৳12,000)</SelectItem>
                      <SelectItem value="dealer">Dealer Partnership (Custom)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Campaign Goals</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us what you want to achieve (e.g., brand awareness, lead generation)..."
                  rows={4}
                  required
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
                {isSubmitting ? "Sending Inquiry..." : "Submit Inquiry"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdvertiseInquiryPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/30 border-b overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <TrendingUp size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-10 relative z-10">
          <div className="max-w-6xl mx-auto">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/advertise">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plans
              </Link>
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Start Your <span className="text-primary">Campaign</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 py-12">
        <Suspense fallback={<div className="text-center py-20">Loading form...</div>}>
          <InquireForm />
        </Suspense>
      </div>
    </div>
  );
}
