"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, HelpCircle, AlertCircle, ArrowLeft, LifeBuoy, ArrowRight, ShieldCheck } from "lucide-react";
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
import { api } from "@/lib/api-service";

export default function SupportPage() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.getPublicConfig();
        if (res.success) setConfig(res.data);
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
      {/* Hero Section */}
      <div className="bg-muted/30 border-b overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <LifeBuoy size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 px-4 py-1">
              Help Center
            </Badge>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight uppercase">
              How Can We <span className="text-primary">Help You?</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
              Need help with your account, listings, or technical issues? Our support team is here to assist you.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 pt-12 max-w-6xl mx-auto">
        {(config?.cms_support_content && config.cms_support_content !== "<p></p>") && (
          <Card className="border-2 mb-12 shadow-sm rounded-3xl overflow-hidden bg-primary/5 border-primary/10">
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
              <h3 className="text-2xl font-black italic uppercase tracking-tight ml-1">Quick Assistance</h3>
              <div className="space-y-4">
                <Link href="/faqs" className="block p-6 rounded-[2rem] border-2 bg-card hover:border-primary transition-all group shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <HelpCircle className="h-6 w-6" />
                      </div>
                      <span className="font-bold text-lg">Browse FAQs</span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>

                <Link href="/contact" className="block p-6 rounded-[2rem] border-2 bg-card hover:border-primary transition-all group shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <span className="font-bold text-lg">Safety Tips</span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
                
                <div className="p-8 rounded-[2.5rem] border-2 bg-muted/30 space-y-8 shadow-inner">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-background border-2 flex items-center justify-center shrink-0 shadow-sm">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Direct Line</h4>
                      <p className="font-black text-xl italic">{config?.cms_support_phone || "+880 1712 999 000"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-background border-2 flex items-center justify-center shrink-0 shadow-sm">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Support Email</h4>
                      <p className="font-black text-xl italic break-all underline decoration-primary/30 decoration-2 underline-offset-4">
                        {config?.cms_support_email || "support@mrbikebd.com"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-[2rem] p-8 border-2 border-dashed border-primary/20 space-y-4">
               <h4 className="font-bold text-primary italic">Response Time</h4>
               <p className="text-muted-foreground font-medium leading-relaxed">
                 We typically respond to all support tickets within <span className="text-primary font-bold italic">4-6 business hours</span>.
               </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-2 shadow-2xl rounded-[3rem] overflow-hidden">
              <CardHeader className="p-8 md:p-12 border-b bg-muted/20">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <CardTitle className="text-3xl md:text-4xl font-black italic tracking-tight uppercase">Submit a Ticket</CardTitle>
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 rounded-full px-4">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Support Bot
                  </Badge>
                </div>
                <CardDescription className="text-lg font-medium">
                  Detailed information helps us solve your problem faster.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Your Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g. Abdullah"
                        className="h-14 rounded-2xl bg-muted/20 border-2 focus-visible:ring-primary"
                        required
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Your Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@email.com"
                        className="h-14 rounded-2xl bg-muted/20 border-2 focus-visible:ring-primary"
                        required
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="category" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Issue Category</Label>
                      <Select
                        onValueChange={(v) => handleSelectChange("category", v)}
                        value={formData.category}
                      >
                        <SelectTrigger id="category" className="h-14 rounded-2xl bg-muted/20 border-2 focus:ring-primary">
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2">
                          <SelectItem value="account">Account & Sign In</SelectItem>
                          <SelectItem value="listings">Bike Listing Issue</SelectItem>
                          <SelectItem value="premium">Premium Subscriptions</SelectItem>
                          <SelectItem value="technical">Bug / Technical Issue</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="priority" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Priority</Label>
                      <Select
                        onValueChange={(v) => handleSelectChange("priority", v)}
                        value={formData.priority}
                      >
                        <SelectTrigger id="priority" className="h-14 rounded-2xl bg-muted/20 border-2 focus:ring-primary">
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2">
                          <SelectItem value="low">Low - Just asking</SelectItem>
                          <SelectItem value="medium">Medium - Annoying</SelectItem>
                          <SelectItem value="high">High - Breaking thing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Describe the Issue</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Please provide as much detail as possible so we can help you better..."
                      className="rounded-2xl bg-muted/20 border-2 min-h-[180px] focus-visible:ring-primary"
                      required
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-16 rounded-2xl text-xl font-black italic uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Generating Ticket..." : <>Submit Ticket <Send className="ml-2 h-5 w-5" /></>}
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
