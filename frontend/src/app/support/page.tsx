"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, Send, HelpCircle, AlertCircle, LifeBuoy, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
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
import { api } from "@/lib/api-service";

type PublicConfig = Record<string, string>;

export default function SupportPage() {
  const [config, setConfig] = useState<PublicConfig | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.getPublicConfig();
        if (res.success) setConfig((res.data as PublicConfig | undefined) ?? null);
      } catch (e) {
        console.error("Failed to load support config:", e);
      }
    }
    loadConfig();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "account",
    priority: "medium",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      toast.success("Support ticket created! Ticket ID: #MB-82736. We'll reply within 4 hours. (Demo Mode)");
      setFormData({ name: "", email: "", category: "account", priority: "medium", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/30 border-b overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <LifeBuoy size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-16 md:py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 px-4 py-1">
              Help Center
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              How Can We <span className="text-primary">Help You?</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Need help with your account, listings, or technical issues? Our support team is here to assist you.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 pt-12 max-w-6xl mx-auto">
        {(config?.cms_support_content && config.cms_support_content !== "<p></p>") && (
          <Card className="mb-12 overflow-hidden bg-primary/5 border-primary/10">
            <CardContent className="p-8 md:p-12 prose prose-lg dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: config.cms_support_content }} />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="w-full px-4 md:px-8 py-20">
        <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          <div className="space-y-10">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold tracking-tight">Quick Assistance</h3>
              <div className="space-y-4">
                <Link href="/faqs" className="block p-4 rounded-xl border bg-card hover:border-primary transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <span className="font-semibold">Browse FAQs</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>

                <Link href="/contact" className="block p-4 rounded-xl border bg-card hover:border-primary transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <span className="font-semibold">Safety Tips</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
                
                <div className="p-6 rounded-xl border bg-muted/30 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-1">Direct Line</h4>
                      <p className="font-semibold text-lg">{config?.cms_support_phone || "+880 1712 999 000"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-1">Support Email</h4>
                      <p className="font-semibold text-lg break-all">
                        {config?.cms_support_email || "support@mrbikebd.com"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-xl p-6 border border-dashed border-primary/20 space-y-3">
               <h4 className="font-semibold text-primary">Response Time</h4>
               <p className="text-muted-foreground leading-relaxed">
                  We typically respond to all support tickets within <span className="text-primary font-semibold">4-6 business hours</span>.
               </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <Card className="shadow-lg overflow-hidden">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <CardTitle className="text-2xl font-bold tracking-tight">Submit a Ticket</CardTitle>
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 rounded-full px-4">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Support Bot
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Detailed information helps us solve your problem faster.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g. Abdullah"
                        className="h-11"
                        required
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Your Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@email.com"
                        className="h-11"
                        required
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Issue Category</Label>
                      <Select
                        onValueChange={(v) => handleSelectChange("category", v)}
                        value={formData.category}
                      >
                        <SelectTrigger id="category" className="h-11">
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="account">Account & Sign In</SelectItem>
                          <SelectItem value="listings">Bike Listing Issue</SelectItem>
                          <SelectItem value="premium">Premium Subscriptions</SelectItem>
                          <SelectItem value="technical">Bug / Technical Issue</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        onValueChange={(v) => handleSelectChange("priority", v)}
                        value={formData.priority}
                      >
                        <SelectTrigger id="priority" className="h-11">
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - Just asking</SelectItem>
                          <SelectItem value="medium">Medium - Annoying</SelectItem>
                          <SelectItem value="high">High - Breaking thing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Describe the Issue</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Please provide as much detail as possible so we can help you better..."
                      className="min-h-[160px]"
                      required
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : <>Submit Ticket <Send className="ml-2 h-4 w-4" /></>}
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
