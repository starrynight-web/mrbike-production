"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { 
    Save, 
    Globe, 
    Shield, 
    Bell, 
    Smartphone, 
    ImageIcon, 
    Plus, 
    Trash2, 
    Loader, 
    Database, 
    LayoutDashboard,
    FileText,
    Info,
    HelpCircle,
    Phone,
    Megaphone,
    Search,
    CheckCircle2,
    Bike,
    Settings,
    ChevronRight,
    Users,
    CreditCard
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { api } from "@/lib/api-service";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { BikeSelect } from "@/components/ui/bike-select";
import { useBrands } from "@/hooks/use-brands";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, Edit2, X } from "lucide-react";
import { adminAPI } from "@/lib/admin-api";
import { ALLOWED_BRANDS } from "@/config/constants";
import { sanitizeImageUrl } from "@/lib/data-utils";

export default function AdminSettings() {
    const queryClient = useQueryClient();
    const { data: dbBrands = [], isLoading: dbBrandsLoading } = useBrands();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Core settings state
    const [settings, setSettings] = useState<any>({
        site_name: "MrBikeBD",
        site_description: "The largest motorcycle marketplace in Bangladesh.",
        contact_email: "support@mrbikebd.com",
        contact_phone: "+880 1XXX XXXXXX",
        maintenance_mode: false,
        
        // Homepage
        hero_title: "Find Your Dream Bike in Bangladesh",
        hero_subtitle: "Buy, Sell, and Enjoy the best biking experience",
        hero_image: "",
        popular_bike_ids: "[]",
        
        // Brands
        allowed_brands: JSON.stringify(ALLOWED_BRANDS),
        
        // CMS Content
        cms_about_title: "About MrBikeBD",
        cms_about_subtitle: "Bangladesh's #1 Motorcycle Ecosystem",
        cms_about_content: "",
        cms_about_stats: "[]",
        cms_about_values: "[]",
        cms_about_cta_title: "Need help?",
        cms_about_cta_desc: "Our support team is here to assist you with your queries about listings, account security, or general feedback.",
        
        cms_support_content: "",
        cms_support_phone: "+880 1712 999 000",
        cms_support_email: "support@mrbikebd.com",
        
        cms_faqs: "[]",
        cms_faqs_cta_title: "Still have questions?",
        cms_faqs_cta_desc: "If you couldn't find what you were looking for, our support team is happy to help you.",
        
        cms_contact_address: "House 12, Road 5, Dhanmondi, Dhaka 1209, Bangladesh",
        cms_contact_phone: "+880 1712 345 678, +880 1812 345 678",
        cms_contact_email: "support@mrbikebd.com, sales@mrbikebd.com",
        cms_contact_hours: "Sunday - Thursday: 10:00 AM - 6:00 PM, Friday - Saturday: Closed",
        cms_contact_map_url: "https://www.google.com/maps/embed/v1/place?q=Dhanmondi,+Dhaka,+Bangladesh",
        cms_contact_whatsapp: "",
        
        cms_advertise_hero_title: "Advertise With Us",
        cms_advertise_hero_desc: "Reach millions of motorcycle enthusiasts in Bangladesh. The perfect platform to showcase your brand, products, and services.",
        cms_advertise_stats: "[]",
        cms_advertise_pricing_title: "Simple, Transparent Pricing",
        cms_advertise_pricing_desc: "Choose the plan that best fits your marketing goals. No hidden fees.",
        cms_advertise_plans: "[]",
        cms_advertise_content: "",
        
        cms_bike_registration_content: "",
        cms_bike_reg_license_fees: "[]",
        cms_bike_reg_steps: "[]",
        cms_bike_reg_smartcard_fees: "[]",
        cms_bike_reg_reg_fees: "[]",
        cms_bike_reg_docs_license: "[]",
        cms_bike_reg_docs_registration: "[]",
        cms_bike_reg_faqs: "[]",
        
        cms_expense_calculator_content: "",
        cms_expense_calculator_title: "Motorcycle Expense Calculator",
        cms_expense_calculator_subtitle: "Track your monthly biking costs with ease.",
    });

    const [uploadingHero, setUploadingHero] = useState(false);

    const loadSettings = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getSettings();
            if (data && Object.keys(data).length > 0) {
                // Merge loaded data with defaults to ensure all keys exist
                setSettings((prev: any) => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
            toast.error("Failed to load settings from server");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleSave = async () => {
        try {
            setSaving(true);
            // The backend handles dict/list by stringifying them, 
            // but we ensure clean objects are sent.
            await adminAPI.updateSettings(settings);
            toast.success("All settings updated successfully");
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast.error("Failed to persist changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleHeroUpload = async (file: File) => {
        try {
            setUploadingHero(true);
            const res = await adminAPI.uploadHeroImage(file);
            setSettings({ ...settings, hero_image: res.url });
            toast.success("Hero image updated");
        } catch (error) {
            toast.error("Hero upload failed");
        } finally {
            setUploadingHero(false);
        }
    };

    // Brand Helpers
    const [editingBrandId, setEditingBrandId] = useState<number | string | null>(null);
    const [newBrandName, setNewBrandName] = useState("");
    const [newBrandDesc, setNewBrandDesc] = useState("");
    const [newBrandOfficialWebsite, setNewBrandOfficialWebsite] = useState("");
    const [newBrandLogo, setNewBrandLogo] = useState<File | null>(null);
    const [isCreatingBrand, setIsCreatingBrand] = useState(false);

    const resetBrandForm = () => {
        setEditingBrandId(null);
        setNewBrandName("");
        setNewBrandDesc("");
        setNewBrandOfficialWebsite("");
        setNewBrandLogo(null);
    };

    const handleEditGlobalBrand = (brand: any) => {
        setEditingBrandId(brand.id);
        setNewBrandName(brand.name);
        setNewBrandDesc(brand.description || "");
        setNewBrandOfficialWebsite(brand.official_website || "");
        setNewBrandLogo(null);
        document.getElementById('brand-form-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleSaveGlobalBrand = async () => {
        if (!newBrandName) return;
        setIsCreatingBrand(true);
        try {
            const formData = new FormData();
            formData.append("name", newBrandName);
            if (newBrandDesc) formData.append("description", newBrandDesc);
            if (newBrandOfficialWebsite) formData.append("official_website", newBrandOfficialWebsite);
            if (newBrandLogo) {
                formData.append("logo", newBrandLogo);
            }
            
            let res;
            if (editingBrandId) {
                res = await api.updateBrand(editingBrandId, formData);
            } else {
                res = await api.createBrand(formData);
            }

            if (res.success) {
                toast.success(editingBrandId ? "Brand updated!" : "Brand created globally!");
                queryClient.invalidateQueries({ queryKey: ["brands"] });
                resetBrandForm();
            } else {
                toast.error(res.error?.message || "Failed to save brand");
            }
        } catch (e) {
            toast.error("An error occurred");
        } finally {
            setIsCreatingBrand(false);
        }
    };

    const handleDeleteGlobalBrand = async (slug: string) => {
        if (!window.confirm("Are you sure you want to completely delete this brand globally? This affects all connected bikes.")) return;
        try {
            const brandToDelete = dbBrands.find(b => b.slug === slug);
            if (!brandToDelete) return;
            const res = await api.deleteBrand(brandToDelete.id!);
            if (res.success !== false) {
                toast.success("Brand deleted globally!");
                queryClient.invalidateQueries({ queryKey: ["brands"] });
            } else {
                toast.error(res.error?.message || "Failed to delete brand");
            }
        } catch (e) {
            toast.error("Error deleting brand");
        }
    };

    // Homepage Bike Helpers
    const getPopularBikeIds = () => {
        try { return JSON.parse(settings.popular_bike_ids || "[]"); } catch (e) { return []; }
    };
    
    const updatePopularBikes = (ids: number[]) => {
        setSettings({ ...settings, popular_bike_ids: JSON.stringify(ids.slice(0, 6)) });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
                <div className="relative">
                    <Loader className="h-12 w-12 animate-spin text-primary" />
                    <Settings className="h-4 w-4 absolute inset-0 m-auto text-primary" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-lg font-medium">Initializing Administration</p>
                    <p className="text-sm text-muted-foreground">Synchronizing site configuration...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-muted/40 border animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Database className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">System Infrastructure</h1>
                        <p className="text-muted-foreground mt-1">Global platform configuration and CMS management.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={loadSettings} className="h-11">
                        Discard Changes
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="h-11 px-8 gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
                        {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? "Saving Changes..." : "Publish Settings"}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="general" className="space-y-8">
                <div className="sticky top-2 z-50 p-1.5 rounded-2xl bg-background/80 backdrop-blur-md border shadow-sm inline-flex w-full md:w-auto overflow-x-auto no-scrollbar">
                    <TabsList className="bg-transparent h-10 w-full md:w-auto gap-1">
                        <TabsTrigger value="general" className="rounded-xl px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                            < Globe className="h-4 w-4 mr-2" /> General
                        </TabsTrigger>
                        <TabsTrigger value="homepage" className="rounded-xl px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                            <LayoutDashboard className="h-4 w-4 mr-2" /> Homepage
                        </TabsTrigger>
                        <TabsTrigger value="brands" className="rounded-xl px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                            <Bike className="h-4 w-4 mr-2" /> Manufacturers
                        </TabsTrigger>
                        <TabsTrigger value="cms" className="rounded-xl px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                            <FileText className="h-4 w-4 mr-2" /> CMS Content
                        </TabsTrigger>
                        <TabsTrigger value="auth" className="rounded-xl px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                            <Shield className="h-4 w-4 mr-2" /> Security & Auth
                        </TabsTrigger>
                        <TabsTrigger value="marketplace" className="rounded-xl px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                            <CreditCard className="h-4 w-4 mr-2" /> Marketplace
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* ==================== GENERAL TAB ==================== */}
                <TabsContent value="general" className="mt-0 space-y-6">
                    <Card className="overflow-hidden border-2 shadow-sm transition-all hover:border-primary/20">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle>Public Identity</CardTitle>
                            <CardDescription>Configure how your platform appears to search engines and users.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label htmlFor="site_name" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">Site Display Name</Label>
                                    <Input
                                        id="site_name"
                                        className="h-12 text-lg focus:ring-primary/20"
                                        value={settings.site_name}
                                        onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="contact_email" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">Global Support Email</Label>
                                    <Input
                                        id="contact_email"
                                        className="h-12 focus:ring-primary/20"
                                        type="email"
                                        value={settings.contact_email}
                                        onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="site_description" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">Meta Description (SEO)</Label>
                                <Textarea
                                    id="site_description"
                                    rows={4}
                                    className="resize-none focus:ring-primary/20"
                                    value={settings.site_description}
                                    onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-destructive/5 border border-destructive/10">
                                <div className="space-y-1">
                                    <Label className="text-destructive font-bold">Maintenance Mode</Label>
                                    <p className="text-sm text-destructive/80">Redirect all traffic to a maintenance page. Staff can still access.</p>
                                </div>
                                <Switch
                                    checked={settings.maintenance_mode}
                                    onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
                                    className="data-[state=checked]:bg-destructive"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ==================== HOMEPAGE TAB ==================== */}
                <TabsContent value="homepage" className="mt-0 space-y-6">
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                             <Card className="border-2 shadow-sm overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b">
                                    <CardTitle>Popular Bike Curation</CardTitle>
                                    <CardDescription>Select specific official models to showcase in the homepage carousel (Limit 6).</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <BikeSelect 
                                        selectedIds={getPopularBikeIds()} 
                                        onChange={updatePopularBikes} 
                                        max={6}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-2 shadow-sm overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b">
                                    <CardTitle>Hero Section Content</CardTitle>
                                    <CardDescription>Update the primary messaging on the landing page.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>H1 Main Title</Label>
                                            <Input 
                                                className="h-12 text-xl font-bold"
                                                value={settings.hero_title || ""} 
                                                onChange={e => setSettings({...settings, hero_title: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Sub-header Message</Label>
                                            <Textarea 
                                                rows={3} 
                                                value={settings.hero_subtitle || ""} 
                                                onChange={e => setSettings({...settings, hero_subtitle: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="border-2 shadow-sm overflow-hidden h-fit">
                                <CardHeader className="bg-muted/30 border-b">
                                    <CardTitle>Hero Image</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="aspect-video relative rounded-xl overflow-hidden border-2 border-dashed flex items-center justify-center bg-muted/20">
                                        {settings.hero_image ? (
                                            <Image src={settings.hero_image} alt="Hero preview" fill className="object-cover" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-xs text-muted-foreground">No image uploaded</p>
                                            </div>
                                        )}
                                        {uploadingHero && (
                                            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                                                <Loader className="h-8 w-8 animate-spin text-primary" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Input 
                                            type="file" 
                                            className="cursor-pointer"
                                            accept="image/*" 
                                            onChange={e => e.target.files?.[0] && handleHeroUpload(e.target.files[0])}
                                            disabled={uploadingHero}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Recommended: 2560x1080px WebP for optimal speed.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* ==================== MANUFACTURERS TAB ==================== */}
                <TabsContent value="brands" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div id="brand-form-container" className="lg:col-span-1 border-2 bg-card shadow-sm rounded-2xl overflow-hidden h-fit">
                            <div className="p-6 border-b bg-muted/30 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold">{editingBrandId ? "Edit Global Brand" : "Add Global Brand"}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{editingBrandId ? "Update existing manufacturer data." : "Registers a new manufacturer directly into the live database."}</p>
                                </div>
                                {editingBrandId && (
                                    <Button variant="ghost" size="icon" onClick={resetBrandForm} title="Cancel Edit">
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="b_name">Brand Name <span className="text-destructive">*</span></Label>
                                    <Input id="b_name" placeholder="e.g. Yamaha" value={newBrandName} onChange={e => setNewBrandName(e.target.value)} disabled={isCreatingBrand} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="b_desc">Description</Label>
                                    <Textarea 
                                        id="b_desc" 
                                        placeholder="Write a short description about this brand..." 
                                        value={newBrandDesc} 
                                        onChange={e => setNewBrandDesc(e.target.value)} 
                                        disabled={isCreatingBrand} 
                                        rows={3} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="b_website">Official Website</Label>
                                    <Input id="b_website" type="url" placeholder="https://..." value={newBrandOfficialWebsite} onChange={e => setNewBrandOfficialWebsite(e.target.value)} disabled={isCreatingBrand} />
                                </div>
                                <div className="space-y-2">
                                    <Label>{editingBrandId ? "Update Brand Logo" : "Brand Logo"}</Label>
                                    <div className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => document.getElementById('b_logo')?.click()}>
                                        {newBrandLogo ? (
                                            <div className="space-y-2">
                                                <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto" />
                                                <p className="text-sm font-medium">{newBrandLogo.name}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
                                                <p className="text-sm text-muted-foreground">Click to select image file</p>
                                            </div>
                                        )}
                                        <input id="b_logo" type="file" className="hidden" accept="image/*" disabled={isCreatingBrand} onChange={e => {
                                            if (e.target.files && e.target.files[0]) {
                                                setNewBrandLogo(e.target.files[0]);
                                            }
                                        }} />
                                    </div>
                                </div>
                                <Button className="w-full mt-4" onClick={handleSaveGlobalBrand} disabled={isCreatingBrand || !newBrandName}>
                                    {isCreatingBrand ? <Loader className="h-4 w-4 animate-spin mr-2" /> : (editingBrandId ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />)} 
                                    {editingBrandId ? "Save Changes" : "Create Brand globally"}
                                </Button>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <Card className="border-2 shadow-sm overflow-hidden h-full flex flex-col">
                                <CardHeader className="bg-muted/30 border-b shrink-0 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Manufacturer Database</CardTitle>
                                        <CardDescription>Live representation of the global Brand table.</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 relative overflow-auto min-h-[400px]">
                                    <div className="grid md:grid-cols-2 xl:grid-cols-3 divide-y md:divide-y-0">
                                        {dbBrandsLoading ? (
                                            <div className="p-12 text-center col-span-full"><Loader className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
                                        ) : dbBrands.length === 0 ? (
                                            <div className="p-12 text-center col-span-full text-muted-foreground">No global brands registered yet.</div>
                                        ) : dbBrands.map((brand: any) => (
                                            <div key={brand.slug} className="group p-6 border-r border-b hover:bg-muted/50 transition-colors relative flex flex-col justify-between">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <div className="h-14 w-14 rounded-full bg-white shadow-sm border p-2 relative flex items-center justify-center overflow-hidden shrink-0">
                                                        {brand.logo ? (
                                                            <Image src={sanitizeImageUrl(brand.logo)} alt={brand.name} fill className="object-contain p-2" />
                                                        ) : (
                                                            <Bike className="h-6 w-6 text-muted-foreground/30" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold truncate">{brand.name}</h4>
                                                        <p className="text-xs text-muted-foreground font-mono">/{brand.slug}</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{brand.description || "No description provided."}</p>
                                                
                                                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button 
                                                        onClick={() => handleEditGlobalBrand(brand)}
                                                        title="Edit Brand"
                                                        className="h-8 w-8 rounded-full bg-background border shadow-sm flex items-center justify-center text-primary transition-all hover:scale-110"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteGlobalBrand(brand.slug)}
                                                        title="Delete Globally"
                                                        className="h-8 w-8 rounded-full bg-background border shadow-sm flex items-center justify-center text-destructive transition-all hover:scale-110"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* ==================== CMS CONTENT TAB ==================== */}
                <TabsContent value="cms" className="mt-0">
                    <Tabs defaultValue="about" className="flex flex-col md:flex-row gap-8">
                        <TabsList className="flex flex-col h-auto bg-muted/40 p-2 rounded-2xl border w-full md:w-64 shrink-0 gap-1">
                            <TabsTrigger value="about" className="justify-start w-full px-4 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <Info className="h-4 w-4 mr-2" /> About Us
                            </TabsTrigger>
                            <TabsTrigger value="services" className="justify-start w-full px-4 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <Plus className="h-4 w-4 mr-2" /> Services
                            </TabsTrigger>
                            <TabsTrigger value="faqs" className="justify-start w-full px-4 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <HelpCircle className="h-4 w-4 mr-2" /> FAQs
                            </TabsTrigger>
                            <TabsTrigger value="contact" className="justify-start w-full px-4 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <Phone className="h-4 w-4 mr-2" /> Contact
                            </TabsTrigger>
                            <TabsTrigger value="advertise" className="justify-start w-full px-4 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <Megaphone className="h-4 w-4 mr-2" /> Advertise
                            </TabsTrigger>
                            <TabsTrigger value="support" className="justify-start w-full px-4 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <CreditCard className="h-4 w-4 mr-2" /> Support
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 space-y-6">
                            {/* ABOUT US CMS */}
                            <TabsContent value="about" className="m-0 animate-in fade-in duration-300">
                                <Card className="border-2">
                                    <CardHeader>
                                        <CardTitle>About Page Editor</CardTitle>
                                        <CardDescription>Tell the story and showcase the mission of MrBikeBD.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Page Headline</Label>
                                                <Input 
                                                    value={settings.cms_about_title} 
                                                    onChange={e => setSettings({...settings, cms_about_title: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Sub-headline</Label>
                                                <Input 
                                                    value={settings.cms_about_subtitle} 
                                                    onChange={e => setSettings({...settings, cms_about_subtitle: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Main Story Content (HTML allowed)</Label>
                                            <RichTextEditor 
                                                content={settings.cms_about_content || ""} 
                                                onChange={val => setSettings({...settings, cms_about_content: val})}
                                            />
                                        </div>

                                        <Separator />

                                        {/* Stats Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-base font-bold">Platform Stats</Label>
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    const current = JSON.parse(settings.cms_about_stats || "[]");
                                                    current.push({ value: "0", label: "New Stat" });
                                                    setSettings({ ...settings, cms_about_stats: JSON.stringify(current) });
                                                }}>
                                                    <Plus className="h-4 w-4 mr-1" /> Add Stat
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {JSON.parse(settings.cms_about_stats || "[]").map((stat: any, idx: number) => (
                                                    <div key={idx} className="p-3 border rounded-xl bg-muted/20 relative group">
                                                        <Input 
                                                            className="h-8 mb-2 font-bold text-center"
                                                            value={stat.value} 
                                                            onChange={e => {
                                                                const current = JSON.parse(settings.cms_about_stats);
                                                                current[idx].value = e.target.value;
                                                                setSettings({...settings, cms_about_stats: JSON.stringify(current)});
                                                            }}
                                                            placeholder="Value (e.g. 300+)"
                                                        />
                                                        <Input 
                                                            className="h-7 text-xs text-center"
                                                            value={stat.label} 
                                                            onChange={e => {
                                                                const current = JSON.parse(settings.cms_about_stats);
                                                                current[idx].label = e.target.value;
                                                                setSettings({...settings, cms_about_stats: JSON.stringify(current)});
                                                            }}
                                                            placeholder="Label"
                                                        />
                                                        <button 
                                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-destructive flex items-center justify-center"
                                                            onClick={() => {
                                                                const current = JSON.parse(settings.cms_about_stats);
                                                                current.splice(idx, 1);
                                                                setSettings({...settings, cms_about_stats: JSON.stringify(current)});
                                                            }}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Values Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-base font-bold">Core Values / Features</Label>
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    const current = JSON.parse(settings.cms_about_values || "[]");
                                                    current.push({ title: "New Value", text: "Description..." });
                                                    setSettings({ ...settings, cms_about_values: JSON.stringify(current) });
                                                }}>
                                                    <Plus className="h-4 w-4 mr-1" /> Add Value
                                                </Button>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {JSON.parse(settings.cms_about_values || "[]").map((val: any, idx: number) => (
                                                    <div key={idx} className="p-4 border rounded-xl bg-muted/20 relative group space-y-2">
                                                        <Input 
                                                            className="font-bold"
                                                            value={val.title} 
                                                            onChange={e => {
                                                                const current = JSON.parse(settings.cms_about_values);
                                                                current[idx].title = e.target.value;
                                                                setSettings({...settings, cms_about_values: JSON.stringify(current)});
                                                            }}
                                                        />
                                                        <Textarea 
                                                            className="h-20 text-sm"
                                                            value={val.text} 
                                                            onChange={e => {
                                                                const current = JSON.parse(settings.cms_about_values);
                                                                current[idx].text = e.target.value;
                                                                setSettings({...settings, cms_about_values: JSON.stringify(current)});
                                                            }}
                                                        />
                                                        <button 
                                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-destructive flex items-center justify-center"
                                                            onClick={() => {
                                                                const current = JSON.parse(settings.cms_about_values);
                                                                current.splice(idx, 1);
                                                                setSettings({...settings, cms_about_values: JSON.stringify(current)});
                                                            }}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* CTA Section */}
                                        <div className="bg-muted/30 p-4 rounded-xl space-y-4">
                                            <h4 className="font-bold flex items-center gap-2">
                                                <Bell className="h-4 w-4 text-primary" /> footer CTA Section
                                            </h4>
                                            <div className="space-y-2">
                                                <Label>CTA Title</Label>
                                                <Input 
                                                    value={settings.cms_about_cta_title} 
                                                    onChange={e => setSettings({...settings, cms_about_cta_title: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>CTA Description</Label>
                                                <Textarea 
                                                    value={settings.cms_about_cta_desc} 
                                                    onChange={e => setSettings({...settings, cms_about_cta_desc: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* SERVICES CMS */}
                            <TabsContent value="services" className="m-0 space-y-6">
                                <Tabs defaultValue="bike-reg" className="w-full">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="bike-reg">Bike Registration</TabsTrigger>
                                        <TabsTrigger value="expense-calc">Expense Calculator</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="bike-reg" className="space-y-6">
                                        <Card className="border-2">
                                            <CardHeader>
                                                <CardTitle>Bike Registration & License</CardTitle>
                                                <CardDescription>Main content and fee structures for legal registration guidance.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label>Introductory Content (HTML)</Label>
                                                    <RichTextEditor 
                                                        content={settings.cms_bike_registration_content || ""} 
                                                        onChange={val => setSettings({...settings, cms_bike_registration_content: val})} 
                                                    />
                                                </div>

                                                <Separator />

                                                {/* Driving License Fees Table */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-base font-bold">Driving License Fees Table</Label>
                                                        <Button variant="outline" size="sm" onClick={() => {
                                                            const current = JSON.parse(settings.cms_bike_reg_license_fees || "[]");
                                                            current.push({ id: current.length + 1, type: "New Type", base: 0, vat: 0, total: 0 });
                                                            setSettings({ ...settings, cms_bike_reg_license_fees: JSON.stringify(current) });
                                                        }}>
                                                            <Plus className="h-4 w-4 mr-1" /> Add Row
                                                        </Button>
                                                    </div>
                                                    <div className="border rounded-xl overflow-hidden">
                                                        <table className="w-full text-sm">
                                                            <thead className="bg-muted">
                                                                <tr>
                                                                    <th className="px-3 py-2 text-left">License Type</th>
                                                                    <th className="px-3 py-2 w-24">Base</th>
                                                                    <th className="px-3 py-2 w-24">VAT</th>
                                                                    <th className="px-3 py-2 w-24">Total</th>
                                                                    <th className="px-3 py-2 w-10"></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y">
                                                                {JSON.parse(settings.cms_bike_reg_license_fees || "[]").map((row: any, idx: number) => (
                                                                    <tr key={idx}>
                                                                        <td className="px-2 py-1">
                                                                            <Input className="h-8 border-none" value={row.type} onChange={e => {
                                                                                const current = JSON.parse(settings.cms_bike_reg_license_fees);
                                                                                current[idx].type = e.target.value;
                                                                                setSettings({ ...settings, cms_bike_reg_license_fees: JSON.stringify(current) });
                                                                            }} />
                                                                        </td>
                                                                        <td className="px-2 py-1">
                                                                            <Input className="h-8 border-none text-right" type="number" value={row.base} onChange={e => {
                                                                                const current = JSON.parse(settings.cms_bike_reg_license_fees);
                                                                                current[idx].base = parseInt(e.target.value) || 0;
                                                                                setSettings({ ...settings, cms_bike_reg_license_fees: JSON.stringify(current) });
                                                                            }} />
                                                                        </td>
                                                                        <td className="px-2 py-1">
                                                                            <Input className="h-8 border-none text-right" type="number" value={row.vat} onChange={e => {
                                                                                const current = JSON.parse(settings.cms_bike_reg_license_fees);
                                                                                current[idx].vat = parseInt(e.target.value) || 0;
                                                                                setSettings({ ...settings, cms_bike_reg_license_fees: JSON.stringify(current) });
                                                                            }} />
                                                                        </td>
                                                                        <td className="px-2 py-1">
                                                                            <Input className="h-8 border-none text-right font-bold" type="number" value={row.total} onChange={e => {
                                                                                const current = JSON.parse(settings.cms_bike_reg_license_fees);
                                                                                current[idx].total = parseInt(e.target.value) || 0;
                                                                                setSettings({ ...settings, cms_bike_reg_license_fees: JSON.stringify(current) });
                                                                            }} />
                                                                        </td>
                                                                        <td className="px-2 py-1">
                                                                            <button className="text-destructive hover:scale-110" onClick={() => {
                                                                                const current = JSON.parse(settings.cms_bike_reg_license_fees);
                                                                                current.splice(idx, 1);
                                                                                setSettings({ ...settings, cms_bike_reg_license_fees: JSON.stringify(current) });
                                                                            }}><Trash2 className="h-4 w-4" /></button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                <Separator />

                                                {/* Application Process */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-base font-bold">Application Steps</Label>
                                                        <Button variant="outline" size="sm" onClick={() => {
                                                            const current = JSON.parse(settings.cms_bike_reg_steps || "[]");
                                                            current.push("New Step Description");
                                                            setSettings({ ...settings, cms_bike_reg_steps: JSON.stringify(current) });
                                                        }}>
                                                            <Plus className="h-4 w-4 mr-1" /> Add Step
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {JSON.parse(settings.cms_bike_reg_steps || "[]").map((step: string, idx: number) => (
                                                            <div key={idx} className="flex gap-2">
                                                                <span className="h-8 w-8 shrink-0 flex items-center justify-center bg-muted rounded-lg font-bold text-xs">{idx + 1}</span>
                                                                <Input value={step} onChange={e => {
                                                                    const current = JSON.parse(settings.cms_bike_reg_steps);
                                                                    current[idx] = e.target.value;
                                                                    setSettings({ ...settings, cms_bike_reg_steps: JSON.stringify(current) });
                                                                }} />
                                                                <Button variant="ghost" size="icon" className="shrink-0 text-destructive" onClick={() => {
                                                                    const current = JSON.parse(settings.cms_bike_reg_steps);
                                                                    current.splice(idx, 1);
                                                                    setSettings({ ...settings, cms_bike_reg_steps: JSON.stringify(current) });
                                                                }}><Trash2 className="h-4 w-4" /></Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <Separator />

                                                {/* Registration & Smart Card Fees Tables */}
                                                <div className="grid md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <Label className="font-bold">Smart Card & RFID Fees</Label>
                                                        <div className="border rounded-lg p-3 space-y-4 bg-muted/20">
                                                            {JSON.parse(settings.cms_bike_reg_smartcard_fees || "[]").map((row: any, idx: number) => (
                                                                <div key={idx} className="grid grid-cols-2 gap-2 pb-2 border-b last:border-0 relative group">
                                                                    <Input className="h-8 bg-background" value={row.item} onChange={e => {
                                                                        const current = JSON.parse(settings.cms_bike_reg_smartcard_fees);
                                                                        current[idx].item = e.target.value;
                                                                        setSettings({ ...settings, cms_bike_reg_smartcard_fees: JSON.stringify(current) });
                                                                    }} />
                                                                    <Input className="h-8 bg-background font-mono text-right" value={row.total} onChange={e => {
                                                                        const current = JSON.parse(settings.cms_bike_reg_smartcard_fees);
                                                                        current[idx].total = e.target.value;
                                                                        setSettings({ ...settings, cms_bike_reg_smartcard_fees: JSON.stringify(current) });
                                                                    }} />
                                                                </div>
                                                            ))}
                                                            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => {
                                                                const current = JSON.parse(settings.cms_bike_reg_smartcard_fees || "[]");
                                                                current.push({ item: "New Item", total: "0 BDT" });
                                                                setSettings({ ...settings, cms_bike_reg_smartcard_fees: JSON.stringify(current) });
                                                            }}>+ Add Card Fee Item</Button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <Label className="font-bold">Motorcycle Reg Fees (By CC)</Label>
                                                        <div className="border rounded-lg p-3 space-y-4 bg-muted/20">
                                                            {JSON.parse(settings.cms_bike_reg_reg_fees || "[]").map((row: any, idx: number) => (
                                                                <div key={idx} className="grid grid-cols-3 gap-2 pb-2 border-b last:border-0">
                                                                    <Input className="h-8 bg-background text-[10px]" value={row.cc} onChange={e => {
                                                                        const current = JSON.parse(settings.cms_bike_reg_reg_fees);
                                                                        current[idx].cc = e.target.value;
                                                                        setSettings({ ...settings, cms_bike_reg_reg_fees: JSON.stringify(current) });
                                                                    }} />
                                                                    <Input className="h-8 bg-background text-[10px]" value={row.period} onChange={e => {
                                                                        const current = JSON.parse(settings.cms_bike_reg_reg_fees);
                                                                        current[idx].period = e.target.value;
                                                                        setSettings({ ...settings, cms_bike_reg_reg_fees: JSON.stringify(current) });
                                                                    }} />
                                                                    <Input className="h-8 bg-background font-bold text-right text-[10px]" value={row.fee} onChange={e => {
                                                                        const current = JSON.parse(settings.cms_bike_reg_reg_fees);
                                                                        current[idx].fee = e.target.value;
                                                                        setSettings({ ...settings, cms_bike_reg_reg_fees: JSON.stringify(current) });
                                                                    }} />
                                                                </div>
                                                            ))}
                                                            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => {
                                                                const current = JSON.parse(settings.cms_bike_reg_reg_fees || "[]");
                                                                current.push({ cc: "100cc", period: "2 Years", fee: "10,000" });
                                                                setSettings({ ...settings, cms_bike_reg_reg_fees: JSON.stringify(current) });
                                                            }}>+ Add Reg Fee Item</Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Separator />

                                                {/* Document Lists */}
                                                <div className="grid md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <Label className="font-bold">License Documents</Label>
                                                        <div className="space-y-2">
                                                            {JSON.parse(settings.cms_bike_reg_docs_license || "[]").map((doc: string, idx: number) => (
                                                                <div key={idx} className="flex gap-2">
                                                                    <Input value={doc} onChange={e => {
                                                                        const current = JSON.parse(settings.cms_bike_reg_docs_license);
                                                                        current[idx] = e.target.value;
                                                                        setSettings({ ...settings, cms_bike_reg_docs_license: JSON.stringify(current) });
                                                                    }} />
                                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                                        const current = JSON.parse(settings.cms_bike_reg_docs_license);
                                                                        current.splice(idx, 1);
                                                                        setSettings({ ...settings, cms_bike_reg_docs_license: JSON.stringify(current) });
                                                                    }}><Trash2 className="h-4 w-4" /></Button>
                                                                </div>
                                                            ))}
                                                            <Button variant="link" size="sm" className="p-0" onClick={() => {
                                                                const current = JSON.parse(settings.cms_bike_reg_docs_license || "[]");
                                                                current.push("New Document Item");
                                                                setSettings({ ...settings, cms_bike_reg_docs_license: JSON.stringify(current) });
                                                            }}>+ Add Document</Button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <Label className="font-bold">Registration Documents</Label>
                                                        <div className="space-y-2">
                                                            {JSON.parse(settings.cms_bike_reg_docs_registration || "[]").map((doc: string, idx: number) => (
                                                                <div key={idx} className="flex gap-2">
                                                                    <Input value={doc} onChange={e => {
                                                                        const current = JSON.parse(settings.cms_bike_reg_docs_registration);
                                                                        current[idx] = e.target.value;
                                                                        setSettings({ ...settings, cms_bike_reg_docs_registration: JSON.stringify(current) });
                                                                    }} />
                                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                                        const current = JSON.parse(settings.cms_bike_reg_docs_registration);
                                                                        current.splice(idx, 1);
                                                                        setSettings({ ...settings, cms_bike_reg_docs_registration: JSON.stringify(current) });
                                                                    }}><Trash2 className="h-4 w-4" /></Button>
                                                                </div>
                                                            ))}
                                                            <Button variant="link" size="sm" className="p-0" onClick={() => {
                                                                const current = JSON.parse(settings.cms_bike_reg_docs_registration || "[]");
                                                                current.push("New Document Item");
                                                                setSettings({ ...settings, cms_bike_reg_docs_registration: JSON.stringify(current) });
                                                            }}>+ Add Document</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="expense-calc" className="space-y-6">
                                        <Card className="border-2">
                                            <CardHeader>
                                                <CardTitle>Expense Calculator Settings</CardTitle>
                                                <CardDescription>Manage text and banners for the calculator tool.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Calculator Title</Label>
                                                        <Input 
                                                            value={settings.cms_expense_calculator_title} 
                                                            onChange={e => setSettings({...settings, cms_expense_calculator_title: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Calculator Subtitle</Label>
                                                        <Input 
                                                            value={settings.cms_expense_calculator_subtitle} 
                                                            onChange={e => setSettings({...settings, cms_expense_calculator_subtitle: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Banner / Top Content (HTML allowed)</Label>
                                                    <RichTextEditor 
                                                        content={settings.cms_expense_calculator_content || ""} 
                                                        onChange={val => setSettings({...settings, cms_expense_calculator_content: val})} 
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </TabsContent>

                            {/* FAQs CMS */}
                            <TabsContent value="faqs" className="m-0 space-y-6">
                                <Card className="border-2">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Grouped Q&A List</CardTitle>
                                            <CardDescription>Manage user queries by categories.</CardDescription>
                                        </div>
                                        <Button variant="outline" size="sm" className="rounded-full" onClick={() => {
                                            const current = JSON.parse(settings.cms_faqs || "[]");
                                            current.push({ category: "New Category", items: [{ q: "New Question", a: "New Answer" }] });
                                            setSettings({ ...settings, cms_faqs: JSON.stringify(current) });
                                        }}>
                                            <Plus className="h-4 w-4 mr-1" /> Add Category
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-8 p-6">
                                        {JSON.parse(settings.cms_faqs || "[]").map((cat: any, cidx: number) => (
                                            <div key={cidx} className="space-y-4 border-l-4 border-primary pl-4 py-2 relative group">
                                                <div className="flex items-center gap-4">
                                                    <Input 
                                                        className="font-bold text-lg bg-muted/30"
                                                        value={cat.category} 
                                                        onChange={e => {
                                                            const current = JSON.parse(settings.cms_faqs);
                                                            current[cidx].category = e.target.value;
                                                            setSettings({...settings, cms_faqs: JSON.stringify(current)});
                                                        }}
                                                    />
                                                    <Button variant="ghost" size="sm" onClick={() => {
                                                        const current = JSON.parse(settings.cms_faqs);
                                                        current[cidx].items.push({ q: "New Question", a: "New Answer" });
                                                        setSettings({...settings, cms_faqs: JSON.stringify(current)});
                                                    }}>
                                                        <Plus className="h-4 w-4 mr-1" /> Add Question
                                                    </Button>
                                                    <button 
                                                        className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            const current = JSON.parse(settings.cms_faqs);
                                                            current.splice(cidx, 1);
                                                            setSettings({...settings, cms_faqs: JSON.stringify(current)});
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="space-y-4 ml-4">
                                                    {cat.items.map((faq: any, fidx: number) => (
                                                        <div key={fidx} className="p-4 border rounded-xl bg-muted/20 space-y-3 relative group/item">
                                                            <Input 
                                                                className="bg-background font-semibold"
                                                                value={faq.q} 
                                                                onChange={e => {
                                                                    const current = JSON.parse(settings.cms_faqs);
                                                                    current[cidx].items[fidx].q = e.target.value;
                                                                    setSettings({...settings, cms_faqs: JSON.stringify(current)});
                                                                }}
                                                            />
                                                            <Textarea 
                                                                className="bg-background min-h-[80px]"
                                                                value={faq.a} 
                                                                onChange={e => {
                                                                    const current = JSON.parse(settings.cms_faqs);
                                                                    current[cidx].items[fidx].a = e.target.value;
                                                                    setSettings({...settings, cms_faqs: JSON.stringify(current)});
                                                                }}
                                                            />
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border shadow-sm opacity-0 group-hover/item:opacity-100 transition-opacity text-destructive"
                                                                onClick={() => {
                                                                    const current = JSON.parse(settings.cms_faqs);
                                                                    current[cidx].items.splice(fidx, 1);
                                                                    setSettings({...settings, cms_faqs: JSON.stringify(current)});
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <Card className="border-2 bg-primary/5">
                                    <CardHeader><CardTitle className="text-sm">FAQ CTA Section</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>CTA Title</Label>
                                            <Input 
                                                value={settings.cms_faqs_cta_title} 
                                                onChange={e => setSettings({...settings, cms_faqs_cta_title: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>CTA Description</Label>
                                            <Textarea 
                                                value={settings.cms_faqs_cta_desc} 
                                                onChange={e => setSettings({...settings, cms_faqs_cta_desc: e.target.value})}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* ADVERTISE CMS */}
                            <TabsContent value="advertise" className="m-0 space-y-6">
                                <Card className="border-2">
                                    <CardHeader>
                                        <CardTitle>Advertising Hero</CardTitle>
                                        <CardDescription>Main banner text for the advertising page.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Hero Title</Label>
                                            <Input 
                                                value={settings.cms_advertise_hero_title} 
                                                onChange={e => setSettings({...settings, cms_advertise_hero_title: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Hero Description</Label>
                                            <Textarea 
                                                value={settings.cms_advertise_hero_desc} 
                                                onChange={e => setSettings({...settings, cms_advertise_hero_desc: e.target.value})}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-2">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Impact Stats</CardTitle>
                                            <CardDescription>Case study numbers to attract advertisers.</CardDescription>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => {
                                            const current = JSON.parse(settings.cms_advertise_stats || "[]");
                                            current.push({ value: "0", label: "New Stat" });
                                            setSettings({ ...settings, cms_advertise_stats: JSON.stringify(current) });
                                        }}>
                                            <Plus className="h-4 w-4 mr-1" /> Add Stat
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {JSON.parse(settings.cms_advertise_stats || "[]").map((stat: any, idx: number) => (
                                                <div key={idx} className="p-3 border rounded-xl bg-muted/20 relative group">
                                                    <Input 
                                                        className="h-8 mb-2 font-bold text-center"
                                                        value={stat.value} 
                                                        onChange={e => {
                                                            const current = JSON.parse(settings.cms_advertise_stats);
                                                            current[idx].value = e.target.value;
                                                            setSettings({...settings, cms_advertise_stats: JSON.stringify(current)});
                                                        }}
                                                    />
                                                    <Input 
                                                        className="h-7 text-xs text-center"
                                                        value={stat.label} 
                                                        onChange={e => {
                                                            const current = JSON.parse(settings.cms_advertise_stats);
                                                            current[idx].label = e.target.value;
                                                            setSettings({...settings, cms_advertise_stats: JSON.stringify(current)});
                                                        }}
                                                    />
                                                    <button 
                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-destructive flex items-center justify-center font-bold"
                                                        onClick={() => {
                                                            const current = JSON.parse(settings.cms_advertise_stats);
                                                            current.splice(idx, 1);
                                                            setSettings({...settings, cms_advertise_stats: JSON.stringify(current)});
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-2">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Pricing Section</CardTitle>
                                            <CardDescription>Manage your advertising tiers.</CardDescription>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => {
                                            const current = JSON.parse(settings.cms_advertise_plans || "[]");
                                            current.push({ name: "New Plan", price: "৳0", period: "/month", description: "", features: [], popular: false });
                                            setSettings({ ...settings, cms_advertise_plans: JSON.stringify(current) });
                                        }}>
                                            <Plus className="h-4 w-4 mr-1" /> Add Plan
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4 border-b pb-6">
                                            <div className="space-y-2">
                                                <Label>Pricing Title</Label>
                                                <Input 
                                                    value={settings.cms_advertise_pricing_title} 
                                                    onChange={e => setSettings({...settings, cms_advertise_pricing_title: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Pricing Subtitle</Label>
                                                <Input 
                                                    value={settings.cms_advertise_pricing_desc} 
                                                    onChange={e => setSettings({...settings, cms_advertise_pricing_desc: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {JSON.parse(settings.cms_advertise_plans || "[]").map((plan: any, idx: number) => (
                                                <div key={idx} className="p-4 border-2 rounded-2xl space-y-4 relative group bg-muted/10">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-3 w-3 rounded-full bg-primary" />
                                                            <Input 
                                                                className="h-8 font-bold border-none bg-transparent p-0"
                                                                value={plan.name} 
                                                                onChange={e => {
                                                                    const current = JSON.parse(settings.cms_advertise_plans);
                                                                    current[idx].name = e.target.value;
                                                                    setSettings({...settings, cms_advertise_plans: JSON.stringify(current)});
                                                                }}
                                                            />
                                                        </div>
                                                        <Switch 
                                                            checked={plan.popular}
                                                            onCheckedChange={checked => {
                                                                const current = JSON.parse(settings.cms_advertise_plans);
                                                                current[idx].popular = checked;
                                                                setSettings({...settings, cms_advertise_plans: JSON.stringify(current)});
                                                            }}
                                                            title="Popular"
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex items-end gap-2">
                                                        <Input 
                                                            className="h-10 text-xl font-black w-32"
                                                            value={plan.price} 
                                                            onChange={e => {
                                                                const current = JSON.parse(settings.cms_advertise_plans);
                                                                current[idx].price = e.target.value;
                                                                setSettings({...settings, cms_advertise_plans: JSON.stringify(current)});
                                                            }}
                                                        />
                                                        <Input 
                                                            className="h-8 text-xs w-20"
                                                            value={plan.period} 
                                                            onChange={e => {
                                                                const current = JSON.parse(settings.cms_advertise_plans);
                                                                current[idx].period = e.target.value;
                                                                setSettings({...settings, cms_advertise_plans: JSON.stringify(current)});
                                                            }}
                                                        />
                                                    </div>

                                                    <Textarea 
                                                        className="h-20 text-xs"
                                                        value={plan.description} 
                                                        placeholder="Short description..."
                                                        onChange={e => {
                                                            const current = JSON.parse(settings.cms_advertise_plans);
                                                            current[idx].description = e.target.value;
                                                            setSettings({...settings, cms_advertise_plans: JSON.stringify(current)});
                                                        }}
                                                    />

                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Features (one per line)</Label>
                                                        <Textarea 
                                                            className="h-24 text-xs font-mono"
                                                            value={(plan.features || []).join('\n')} 
                                                            onChange={e => {
                                                                const current = JSON.parse(settings.cms_advertise_plans);
                                                                current[idx].features = e.target.value.split('\n');
                                                                setSettings({...settings, cms_advertise_plans: JSON.stringify(current)});
                                                            }}
                                                        />
                                                    </div>

                                                    <button 
                                                        className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-background border shadow-md flex items-center justify-center text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            const current = JSON.parse(settings.cms_advertise_plans);
                                                            current.splice(idx, 1);
                                                            setSettings({...settings, cms_advertise_plans: JSON.stringify(current)});
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-2">
                                    <CardHeader><CardTitle>Detailed Story/Info</CardTitle></CardHeader>
                                    <CardContent>
                                        <RichTextEditor 
                                            content={settings.cms_advertise_content || ""} 
                                            onChange={val => setSettings({...settings, cms_advertise_content: val})} 
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* SUPPORT CMS */}
                            <TabsContent value="support" className="m-0 space-y-6">
                                <Card className="border-2">
                                    <CardHeader>
                                        <CardTitle>Support Center</CardTitle>
                                        <CardDescription>Direct contact channels for urgent user help.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Emergency Support Phone</Label>
                                                <div className="flex gap-2">
                                                    <div className="bg-muted p-2 rounded-lg border flex items-center justify-center">
                                                        <Phone className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <Input 
                                                        value={settings.cms_support_phone} 
                                                        onChange={e => setSettings({...settings, cms_support_phone: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Support Email</Label>
                                                <div className="flex gap-2">
                                                    <div className="bg-muted p-2 rounded-lg border flex items-center justify-center">
                                                        <Globe className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <Input 
                                                        value={settings.cms_support_email} 
                                                        onChange={e => setSettings({...settings, cms_support_email: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Announcement / Help Content</Label>
                                            <RichTextEditor 
                                                content={settings.cms_support_content || ""} 
                                                onChange={val => setSettings({...settings, cms_support_content: val})} 
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* CONTACT CMS */}
                            <TabsContent value="contact" className="m-0">
                                <Card className="border-2">
                                    <CardHeader>
                                        <CardTitle>Global Contacts</CardTitle>
                                        <CardDescription>Update how users can reach you across the platform.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>WhatsApp Hotline</Label>
                                                <Input 
                                                    value={settings.cms_contact_whatsapp} 
                                                    onChange={e => setSettings({...settings, cms_contact_whatsapp: e.target.value})}
                                                    placeholder="+8801..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Other Phone Numbers (Comma separated)</Label>
                                                <Input 
                                                    value={settings.cms_contact_phone} 
                                                    onChange={e => setSettings({...settings, cms_contact_phone: e.target.value})}
                                                    placeholder="+880 1712..., +880 1812..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email Addresses (Comma separated)</Label>
                                                <Input 
                                                    value={settings.cms_contact_email} 
                                                    onChange={e => setSettings({...settings, cms_contact_email: e.target.value})}
                                                    placeholder="support@mrbikebd.com, sales@..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Office Physical Address</Label>
                                                <Input 
                                                    value={settings.cms_contact_address} 
                                                    onChange={e => setSettings({...settings, cms_contact_address: e.target.value})}
                                                    placeholder="Building, Road, City"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Business Hours</Label>
                                            <Input 
                                                value={settings.cms_contact_hours} 
                                                onChange={e => setSettings({...settings, cms_contact_hours: e.target.value})}
                                                placeholder="Sunday - Thursday: 10:00 AM - 6:00 PM"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Google Maps Embed URL</Label>
                                            <Input 
                                                value={settings.cms_contact_map_url} 
                                                onChange={e => setSettings({...settings, cms_contact_map_url: e.target.value})}
                                                placeholder="https://www.google.com/maps/embed/..."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </TabsContent>

                 {/* ==================== SECURITY & AUTH TAB ==================== */}
                 <TabsContent value="auth" className="mt-0">
                    <Card className="border-2 shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle>Verification & Access</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Public User Registration</Label>
                                    <p className="text-sm text-muted-foreground">When disabled, only admins can invite new users.</p>
                                </div>
                                <Switch
                                    checked={settings.enable_registration}
                                    onCheckedChange={(checked) => setSettings({ ...settings, enable_registration: checked })}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Force Mandatory Verification</Label>
                                    <p className="text-sm text-muted-foreground">Users must verify email/identity before posting listings.</p>
                                </div>
                                <Switch
                                    checked={settings.require_verification}
                                    onCheckedChange={(checked) => setSettings({ ...settings, require_verification: checked })}
                                />
                            </div>
                            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex gap-4">
                                <Shield className="h-5 w-5 text-orange-600 shrink-0 mt-1" />
                                <div className="space-y-1">
                                    <h4 className="font-bold text-orange-900 leading-none">RBAC System Operational</h4>
                                    <p className="text-sm text-orange-800/80">Site settings are restricted to staff with the <code>staff_settings</code> role. Permission checks are enforced by server-level policy.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
