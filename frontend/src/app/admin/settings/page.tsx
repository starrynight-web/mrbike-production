"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Save,
    Globe,
    Mail,
    Shield,
    Bell,
    Database,
    Loader,
    Smartphone,
    CheckCircle2,
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
import { adminAPI } from "@/lib/admin-api";

export default function AdminSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>({
        site_name: "MrBikeBD",
        site_description: "The largest motorcycle marketplace in Bangladesh.",
        contact_email: "support@mrbikebd.com",
        contact_phone: "+880 123456789",
        maintenance_mode: false,
        enable_registration: true,
        require_email_verification: true,
        max_listing_images: 10,
        listing_expiry_days: 90,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getSettings();
            if (data) setSettings(data);
        } catch (error) {
            console.error("Failed to load settings:", error);
            // Fallback to defaults if API fails
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await adminAPI.updateSettings(settings);
            toast.success("Settings saved successfully");
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading system settings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground mt-1">Configure site-wide preferences and platform parameters.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
                    {saving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="general" className="data-[state=active]:bg-background">General</TabsTrigger>
                    <TabsTrigger value="auth" className="data-[state=active]:bg-background">Auth & Security</TabsTrigger>
                    <TabsTrigger value="marketplace" className="data-[state=active]:bg-background">Marketplace</TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-background">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-primary" />
                                <CardTitle>General Configuration</CardTitle>
                            </div>
                            <CardDescription>Basic site identity and public information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="site_name">Site Name</Label>
                                    <Input
                                        id="site_name"
                                        value={settings.site_name}
                                        onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact_email">Support Email</Label>
                                    <Input
                                        id="contact_email"
                                        type="email"
                                        value={settings.contact_email}
                                        onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="site_description">Site Description</Label>
                                <Textarea
                                    id="site_description"
                                    rows={3}
                                    value={settings.site_description}
                                    onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Maintenance Mode</Label>
                                    <p className="text-sm text-muted-foreground">Temporarily disable public access to the marketplace.</p>
                                </div>
                                <Switch
                                    checked={settings.maintenance_mode}
                                    onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="auth">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                <CardTitle>Authentication Settings</CardTitle>
                            </div>
                            <CardDescription>Manage user access and verification flows.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Allow New Registrations</Label>
                                    <p className="text-sm text-muted-foreground">Enable or disable public account creation.</p>
                                </div>
                                <Switch
                                    checked={settings.enable_registration}
                                    onCheckedChange={(checked) => setSettings({ ...settings, enable_registration: checked })}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enforce Email Verification</Label>
                                    <p className="text-sm text-muted-foreground">Users must verify their email before they can log in.</p>
                                </div>
                                <Switch
                                    checked={settings.require_email_verification}
                                    onCheckedChange={(checked) => setSettings({ ...settings, require_email_verification: checked })}
                                />
                            </div>
                            <Separator />
                            <div className="bg-muted/30 p-4 rounded-lg flex items-start gap-4">
                                <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold">Phone Login Deprecated</h4>
                                    <p className="text-sm text-muted-foreground">SMS/Phone authentication has been disabled in the backend. All new accounts must be created via Email or Google.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="marketplace">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-primary" />
                                <CardTitle>Marketplace Parameters</CardTitle>
                            </div>
                            <CardDescription>Control listing constraints and behavior.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="max_images">Max Images per Listing</Label>
                                    <Input
                                        id="max_images"
                                        type="number"
                                        value={settings.max_listing_images}
                                        onChange={(e) => setSettings({ ...settings, max_listing_images: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expiry">Listing Expiry (Days)</Label>
                                    <Input
                                        id="expiry"
                                        type="number"
                                        value={settings.listing_expiry_days}
                                        onChange={(e) => setSettings({ ...settings, listing_expiry_days: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-primary" />
                                <CardTitle>Email & Notifications</CardTitle>
                            </div>
                            <CardDescription>Configure how the system communicates with users.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-lg flex items-start gap-4">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-green-900">Brevo SDK Active</h4>
                                    <p className="text-sm text-green-800/80">The system is currently using the official Brevo Python SDK for all transactional emails.</p>
                                </div>
                            </div>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sender_name">Default Sender Name</Label>
                                    <Input id="sender_name" value="MrBikeBD Support" disabled />
                                    <p className="text-[10px] text-muted-foreground">Configured in server environment variables.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
