"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, AlertCircle } from "lucide-react";
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
import { api } from "@/lib/api-service";
import { toast } from "sonner";

type PublicConfig = Record<string, string>;

export default function ContactPage() {
  const [config, setConfig] = useState<PublicConfig | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.getPublicConfig();
        if (res.success) setConfig((res.data as PublicConfig | undefined) ?? null);
      } catch (e) {
        console.error("Failed to load contact config:", e);
      }
    }
    loadConfig();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubjectChange = (value: string) => {
    setFormData({ ...formData, subject: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon. (Demo Mode)");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  // Helper to split comma strings
  const splitItems = (str: string) => str ? str.split(",").map(s => s.trim()) : [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/30 border-b overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <MessageSquare size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-16 md:py-20 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 px-4 py-1">
              Get in Touch
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Contact <span className="text-primary">Us</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              We&apos;re here to help. Send us a message or reach out using the
              contact information below.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 mt-12 max-w-6xl mx-auto">
        {(config?.cms_contact_content && config.cms_contact_content !== "<p></p>") && (
          <Card className="mb-12 overflow-hidden">
            <CardContent className="p-8 prose prose-lg dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: config.cms_contact_content }} />
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="space-y-8">
            <div className="space-y-6">
                <Card className="border-none shadow-none bg-transparent p-0">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">
                        Office Address
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {config?.cms_contact_address || "House 12, Road 5, Dhanmondi, Dhaka 1209, Bangladesh"}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="border-none shadow-none bg-transparent p-0">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Phone</h4>
                      <div className="text-muted-foreground space-y-1">
                        {splitItems(config?.cms_contact_phone || "+880 1712 345 678, +880 1812 345 678").map((p, i) => (
                           <div key={i}>{p}</div>
                        ))}
                        {config?.cms_contact_whatsapp && (
                          <div className="text-primary font-medium pt-1 flex items-center gap-2 leading-none">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            WhatsApp: {config.cms_contact_whatsapp}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="border-none shadow-none bg-transparent p-0">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Email</h4>
                      <div className="text-muted-foreground space-y-1">
                        {splitItems(config?.cms_contact_email || "support@mrbikebd.com, sales@mrbikebd.com").map((e, i) => (
                           <div key={i}>{e}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="border-none shadow-none bg-transparent p-0">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">
                        Business Hours
                      </h4>
                      <div className="text-muted-foreground space-y-1">
                        {splitItems(config?.cms_contact_hours || "Sunday - Thursday: 10:00 AM - 6:00 PM, Friday - Saturday: Closed").map((h, i) => (
                           <div key={i}>{h}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
            </div>

            <div className="h-64 rounded-xl overflow-hidden relative border bg-muted/30">
              <iframe
                title="Office Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={config?.cms_contact_map_url || "https://www.google.com/maps/embed/v1/place?q=Dhanmondi,+Dhaka,+Bangladesh"}
              ></iframe>
            </div>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <CardTitle className="text-2xl font-bold">Send a Message</CardTitle>
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 rounded-full px-3">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Demo Mode
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  This form is currently for demonstration purposes. Messages will not be sent to our team during the preview.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g. Abdullah Al Mamun"
                        className="h-11"
                        required
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className="h-11"
                        required
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      onValueChange={handleSubjectChange}
                      value={formData.subject}
                    >
                      <SelectTrigger id="subject" className="h-11">
                        <SelectValue placeholder="What is this regarding?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="sales">Sales & Advertising</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Your Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about how we can help..."
                      className="min-h-[180px]"
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
                    {isSubmitting ? "Sending..." : <>Send Message <Send className="ml-2 h-4 w-4" /></>}
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
