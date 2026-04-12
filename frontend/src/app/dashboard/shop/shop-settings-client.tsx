"use client";

import { useShop } from "@/hooks/use-shop";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Store, 
  MapPin, 
  Globe, 
  Map as MapIcon, 
  Camera, 
  MessageSquare, 
  Phone, 
  CheckCircle2, 
  Loader2, 
  Eye, 
  Share2,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const shopSchema = z.object({
  name: z.string().min(3, "Shop name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
  location_full: z.string().min(5, "Full address is required"),
  location_city: z.string().min(2, "City is required"),
  location_area: z.string().optional(),
  contact_number: z.string().min(11, "Valid contact number is required"),
  whatsapp_number: z.string().optional(),
  map_location: z.string().optional(),
});

type ShopFormData = z.infer<typeof shopSchema>;

export default function ShopSettingsPage() {
  const { shop, isLoading, updateShop, refresh } = useShop();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
  });

  useEffect(() => {
    if (shop) {
      reset({
        name: shop.name || "",
        description: shop.description || "",
        location_full: shop.location_full || "",
        location_city: shop.location_city || "",
        location_area: shop.location_area || "",
        contact_number: shop.contact_number || "",
        whatsapp_number: shop.whatsapp_number || "",
        map_location: shop.map_location || "",
      });
      setLogoPreview(shop.logo || null);
      setCoverPreview(shop.cover_image || null);
    }
  }, [shop, reset]);

  const onFormSubmit = async (data: ShopFormData) => {
    setIsSaving(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    // Handle files if they were picked
    const logoInput = document.getElementById('logo-upload') as HTMLInputElement;
    const coverInput = document.getElementById('cover-upload') as HTMLInputElement;
    
    if (logoInput?.files?.[0]) {
      formData.append('logo', logoInput.files[0]);
    }
    if (coverInput?.files?.[0]) {
      formData.append('cover_image', coverInput.files[0]);
    }

    const result = await updateShop(formData);
    setIsSaving(false);
    if (result.success) {
      refresh();
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  if (isLoading && !shop) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section with quick stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
            <Store className="h-8 w-8 text-orange-500" />
            Shop Management
          </h1>
          <p className="text-zinc-500 mt-1">Configure your online presence and build your bike business brand.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="rounded-xl">
            <Link href={`/shop/${shop?.slug || 'preview'}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" /> Preview
            </Link>
          </Button>
          <Button 
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20"
            onClick={handleSubmit(onFormSubmit)}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <div className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4" /> Save Changes</div>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Media & Previews */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm group">
            <div className="relative aspect-[3/1] bg-muted overflow-hidden">
               {coverPreview ? (
                 <img src={coverPreview} alt="Cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-zinc-400">
                   <Globe className="h-10 w-10 opacity-20" />
                 </div>
               )}
               <label htmlFor="cover-upload" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                 <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2">
                   <Camera className="h-4 w-4" /> Change Cover
                 </div>
                 <input id="cover-upload" type="file" className="hidden" accept="image/*" onChange={handleCoverChange} />
               </label>
            </div>
            <div className="px-6 pb-6 relative">
              <div className="flex justify-center -mt-12 relative z-10">
                <div className="relative group/logo">
                   <Avatar className="h-24 w-24 border-4 border-white dark:border-zinc-900 shadow-xl">
                     <AvatarImage src={logoPreview || undefined} />
                     <AvatarFallback className="bg-orange-50 text-orange-500">
                       <Store className="h-10 w-10" />
                     </AvatarFallback>
                   </Avatar>
                   <label htmlFor="logo-upload" className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                     <Camera className="h-6 w-6 text-white" />
                     <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                   </label>
                </div>
              </div>
              <div className="text-center mt-4 space-y-1">
                <h3 className="font-bold text-xl">{shop?.name || "Your Shop Name"}</h3>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant={shop?.is_verified ? "default" : "secondary"} className="rounded-full px-3">
                    {shop?.is_verified ? <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Verified Shop</div> : "Awaiting Verification"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-50/50 dark:bg-zinc-900/50">
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Quick Insights</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-2xl font-bold text-orange-500">{shop?.listings_count || 0}</p>
                <p className="text-xs text-zinc-500">Active Listings</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-2xl font-bold text-orange-500">{shop?.total_views || 0}</p>
                <p className="text-xs text-zinc-500">Shop Views</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Form Sections */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl w-full flex justify-start mb-6">
              <TabsTrigger value="general" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">General</TabsTrigger>
              <TabsTrigger value="location" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Location</TabsTrigger>
              <TabsTrigger value="contact" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Contact</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="general" className="mt-0 space-y-6">
                  <Card className="rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b p-6">
                      <CardTitle className="text-lg">Shop Identity</CardTitle>
                      <CardDescription>Tell the world who you are and what you offer.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="grid gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-bold flex items-center gap-2"><Store className="h-4 w-4 text-orange-500" /> Shop Name</Label>
                          <Input id="name" {...register("name")} className="h-12 rounded-xl" placeholder="e.g. Dhaka Motors, Bike Zone" />
                          {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm font-bold flex items-center gap-2"><Info className="h-4 w-4 text-orange-500" /> Description</Label>
                          <Textarea 
                            id="description" 
                            {...register("description")} 
                            className="min-h-[160px] rounded-xl resize-none" 
                            placeholder="Introduce your shop to potential buyers. What services do you provide? Do you offer exchange or EMI?" 
                          />
                          {errors.description && <p className="text-xs text-rose-500">{errors.description.message}</p>}
                          <p className="text-xs text-zinc-400">Mention if you provide warranty or spare parts to increase trust.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="location" className="mt-0 space-y-6">
                  <Card className="rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b p-6">
                      <CardTitle className="text-lg">Shop Presence</CardTitle>
                      <CardDescription>Make it easy for buyers to find your physical outlet.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="location_city" className="text-sm font-bold flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-500" /> City / District</Label>
                          <Input id="location_city" {...register("location_city")} className="h-12 rounded-xl" placeholder="e.g. Dhaka, Chittagong" />
                          {errors.location_city && <p className="text-xs text-rose-500">{errors.location_city.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location_area" className="text-sm font-bold">Area / Neighborhood</Label>
                          <Input id="location_area" {...register("location_area")} className="h-12 rounded-xl" placeholder="e.g. Banani, Mirpur" />
                        </div>
                        <div className="col-span-full space-y-2">
                          <Label htmlFor="location_full" className="text-sm font-bold">Full Address</Label>
                          <Input id="location_full" {...register("location_full")} className="h-12 rounded-xl" placeholder="House 00, Road 00, Block A, ..." />
                          {errors.location_full && <p className="text-xs text-rose-500">{errors.location_full.message}</p>}
                        </div>
                        <div className="col-span-full space-y-2">
                          <Label htmlFor="map_location" className="text-sm font-bold flex items-center gap-2"><MapIcon className="h-4 w-4 text-orange-500" /> Google Maps Embed URL</Label>
                          <Input id="map_location" {...register("map_location")} className="h-12 rounded-xl" placeholder="Paste the iframe src URL from Google Maps" />
                          <p className="text-xs text-zinc-400 font-medium bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 flex items-start gap-2">
                            <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                            Go to Google Maps → Share → Embed a map → Copy the URL inside the src=\"...\" attribute.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contact" className="mt-0 space-y-6">
                  <Card className="rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b p-6">
                      <CardTitle className="text-lg">Communication Channels</CardTitle>
                      <CardDescription>Which numbers should buyers use to reach you?</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="contact_number" className="text-sm font-bold flex items-center gap-2"><Phone className="h-4 w-4 text-orange-500" /> Official Phone Number</Label>
                          <Input id="contact_number" {...register("contact_number")} className="h-12 rounded-xl" placeholder="01XXXXXXXXX" />
                          {errors.contact_number && <p className="text-xs text-rose-500">{errors.contact_number.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="whatsapp_number" className="text-sm font-bold flex items-center gap-2"><MessageSquare className="h-4 w-4 text-green-500" /> WhatsApp Number</Label>
                          <Input id="whatsapp_number" {...register("whatsapp_number")} className="h-12 rounded-xl" placeholder="01XXXXXXXXX" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
