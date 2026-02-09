"use client";

import { useState } from "react";
import {
  ArrowRight,
  BarChart,
  Check,
  Mail,
  Megaphone,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import { api } from "@/lib/api-service";
import { toast } from "sonner";

export default function AdvertisePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.sendInquiry({
        ...formData,
        subject: "advertise",
      });
      toast.success(
        "Thank you for your interest! We will contact you shortly.",
      );
      setFormData({ name: "", email: "", company: "", message: "" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { label: "Monthly Visitors", value: "500K+", icon: Users },
    { label: "Active Listings", value: "10K+", icon: Megaphone },
    { label: "Bike Enthusiasts", value: "1M+", icon: Target },
    { label: "Engagement Rate", value: "15%", icon: BarChart },
  ];

  const pricingPlans = [
    {
      name: "Standard Banner",
      price: "৳5,000",
      period: "/month",
      description: "Great for quick visibility boost",
      features: [
        "Homepage Sidebar Banner",
        "Bike Listing Page Banner",
        "Mobile Responsive",
        "Weekly Performance Report",
      ],
      popular: false,
    },
    {
      name: "Premium Feature",
      price: "৳12,000",
      period: "/month",
      description: "Maximum exposure for your brand",
      features: [
        "Top Homepage Banner",
        "Featured Bike Listing (Top 3)",
        "Social Media Mention",
        "Dedicated Support",
        "Detailed Analytics Dashboard",
      ],
      popular: true,
    },
    {
      name: "Dealer Partnership",
      price: "Custom",
      period: "",
      description: "Tailored solution for large dealerships",
      features: [
        "Verified Dealer Badge",
        "Unlimited Featured Listings",
        "Priority Search Ranking",
        "Custom Lead Generation Form",
        "API Integration",
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section (Reference: About Page) */}
      <div className="bg-muted/30 border-b overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <TrendingUp size={400} />
        </div>
        <div className="container py-20 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
              Grow Your Business
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Advertise <span className="text-primary">With Us</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Reach millions of motorcycle enthusiasts in Bangladesh. The
              perfect platform to showcase your brand, products, and services.
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                className="h-12 px-8"
                onClick={() =>
                  document
                    .getElementById("contact-form")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section (Reference: About Page Values) */}
      <div className="container py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-4 text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-3xl font-bold">{stat.value}</h3>
                <p className="text-muted-foreground text-sm font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section (Reference: Expense Calculator Cards) */}
      <div className="bg-muted/30 py-20">
        <div className="container">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that best fits your marketing goals. No hidden
              fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative flex flex-col transition-all duration-300 ${
                  plan.popular
                    ? "border-primary shadow-xl scale-105 z-10"
                    : "hover:shadow-lg hover:-translate-y-1"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div>
                    <span className="text-4xl font-bold text-primary">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground font-medium">
                      {plan.period}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className="mt-1">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    Choose Plan
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form Section (Reference: Expense Calculator Form) */}
      <div id="contact-form" className="container py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">
                  Ready to Grow?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Fill out the form and our advertising team will get back to
                  you within 24 hours with a custom proposal.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Email Us Directly</h3>
                    <p className="text-muted-foreground">ads@mrbikebd.com</p>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Inquire Now</CardTitle>
                <CardDescription>
                  Tell us about your campaign goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        placeholder="Your Company"
                        value={formData.company}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us about your advertising needs..."
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Inquiry"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
