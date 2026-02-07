"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Bike,
  ExternalLink,
  Save,
    Loader,
    Upload,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { BIKE_CATEGORIES } from "@/config/constants";
import { adminAPI } from "@/lib/admin-api";

export default function AdminBikesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [bikes, setBikes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [newBike, setNewBike] = useState({
        name: "",
        brand: "",
        category: "commuter",
        price: 0,
        description: "",
        engine_cc: 0,
        fuel_type: "petrol",
        transmission: "manual",
        braking_system: "hydraulic",
        featured: false,
    });

    useEffect(() => {
        loadBikes();
    }, []);

    const loadBikes = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllBikes({
                limit: 100,
                offset: 0,
            });
            setBikes(response.results || response);
        } catch (error) {
            console.error("Failed to load bikes:", error);
            toast.error("Failed to load bikes");
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddBike = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setSubmitting(true);

            let imageUrl = newBike.image_url || imagePreview;

            // Upload image if provided
            if (imageFile && !imageFile.name?.startsWith('data:')) {
                try {
                    const uploadResult = await adminAPI.uploadImage(imageFile);
                    imageUrl = uploadResult.url;
                } catch (error) {
                    toast.error("Failed to upload image");
                    return;
                }
            } else if (imagePreview?.startsWith('data:')) {
                // Don't use base64 data URLs
                imageUrl = newBike.image_url || '';
            }

            const bikeData = {
                ...newBike,
                price: Number(newBike.price),
                image_url: imageUrl,
            };

            if (editingId) {
                await adminAPI.updateBike(editingId, bikeData);
                toast.success("Bike updated successfully");
            } else {
                await adminAPI.createBike(bikeData);
                toast.success("New bike model added successfully");
            }

            setIsAddDialogOpen(false);
            resetForm();
            await loadBikes();
        } catch (error) {
            console.error("Failed to save bike:", error);
            toast.error(editingId ? "Failed to update bike" : "Failed to add bike");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setNewBike({
            name: "",
            brand: "",
            category: "commuter",
            price: 0,
            description: "",
            engine_cc: 0,
            fuel_type: "petrol",
            transmission: "manual",
            braking_system: "hydraulic",
            featured: false,
            image_url: "",
        });
        setImageFile(null);
        setImagePreview("");
        setEditingId(null);
    };

    const handleEdit = (bike: any) => {
        setNewBike({
            name: bike.name,
            brand: bike.brand,
            category: bike.category,
            price: bike.price,
            description: bike.description || "",
            engine_cc: bike.engine_cc || 0,
            fuel_type: bike.fuel_type || "petrol",
            transmission: bike.transmission || "manual",
            braking_system: bike.braking_system || "hydraulic",
            featured: bike.featured || false,
            image_url: bike.image_url || "",
        });
        setImagePreview(bike.image_url || "");
        setEditingId(bike.id);
        setIsAddDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this bike model?")) return;

        try {
            setDeletingId(id);
            await adminAPI.deleteBike(id);
            toast.success("Bike model deleted successfully");
            await loadBikes();
        } catch (error) {
            console.error("Failed to delete bike:", error);
            toast.error("Failed to delete bike");
        } finally {
            setDeletingId(null);
        }
    };

    const handleDuplicate = async (bike: any) => {
        try {
            await adminAPI.duplicateBike(bike.id);
            toast.success("Bike model duplicated as draft");
            await loadBikes();
        } catch (error) {
            console.error("Failed to duplicate bike:", error);
            toast.error("Failed to duplicate bike");
        }
    };

  const filteredBikes = bikes.filter((bike) => {
    const matchesSearch =
      bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bike.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || bike.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this bike model?")) {
      setBikes(bikes.filter((b) => b.id !== id));
      toast.success("Bike model deleted successfully");
    }
  };

  const handleDuplicate = (id: string) => {
    const bikeToDuplicate = bikes.find((b) => b.id === id);
    if (bikeToDuplicate) {
      const newBike = {
        ...bikeToDuplicate,
        // eslint-disable-next-line
        id: Date.now().toString(),
        name: `${bikeToDuplicate.name} (Copy)`,
        status: "draft" as const,
      };
      setBikes([newBike, ...bikes]);
      toast.success("Bike model duplicated as draft");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Official Bikes</h1>
          <p className="text-muted-foreground">
            Manage the database of official motorcycle models available in
            Bangladesh.
          </p>
        </div>

                <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                    setIsAddDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="shrink-0">
                            <Plus className="mr-2 h-4 w-4" /> Add New Bike
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleAddBike}>
                            <DialogHeader>
                                <DialogTitle>{editingId ? "Edit Bike Model" : "Add Official Bike Model"}</DialogTitle>
                                <DialogDescription>
                                    {editingId ? "Update bike specifications." : "Create a new entry in the official bike database."}
                                </DialogDescription>
                            </DialogHeader>

              <Tabs defaultValue="basic" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="engine">Engine & Performance</TabsTrigger>
                  <TabsTrigger value="image">Image</TabsTrigger>
                </TabsList>

                                <TabsContent value="basic" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Bike Name *</Label>
                                            <Input
                                                id="name"
                                                placeholder="e.g. Yamaha R15 V4"
                                                required
                                                value={newBike.name}
                                                onChange={e => setNewBike({ ...newBike, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="brand">Brand *</Label>
                                            <Input
                                                id="brand"
                                                placeholder="e.g. Yamaha"
                                                required
                                                value={newBike.brand}
                                                onChange={e => setNewBike({ ...newBike, brand: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category *</Label>
                                            <Select
                                                value={newBike.category}
                                                onValueChange={v => setNewBike({ ...newBike, category: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {BIKE_CATEGORIES.map(cat => (
                                                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Base Price (BDT) *</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                placeholder="0"
                                                required
                                                value={newBike.price || ""}
                                                onChange={e => setNewBike({ ...newBike, price: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Write a brief overview for the bike's landing page..."
                                            rows={4}
                                            value={newBike.description}
                                            onChange={e => setNewBike({ ...newBike, description: e.target.value })}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="engine" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="engine_cc">Engine (CC)</Label>
                                            <Input
                                                id="engine_cc"
                                                type="number"
                                                placeholder="e.g. 155"
                                                value={newBike.engine_cc || ""}
                                                onChange={e => setNewBike({ ...newBike, engine_cc: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="fuel_type">Fuel Type</Label>
                                            <Select
                                                value={newBike.fuel_type}
                                                onValueChange={v => setNewBike({ ...newBike, fuel_type: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="petrol">Petrol</SelectItem>
                                                    <SelectItem value="diesel">Diesel</SelectItem>
                                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="transmission">Transmission</Label>
                                            <Select
                                                value={newBike.transmission}
                                                onValueChange={v => setNewBike({ ...newBike, transmission: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="manual">Manual</SelectItem>
                                                    <SelectItem value="automatic">Automatic</SelectItem>
                                                    <SelectItem value="cvt">CVT</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="braking_system">Braking System</Label>
                                            <Select
                                                value={newBike.braking_system}
                                                onValueChange={v => setNewBike({ ...newBike, braking_system: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="mechanical">Mechanical</SelectItem>
                                                    <SelectItem value="hydraulic">Hydraulic</SelectItem>
                                                    <SelectItem value="disc">Disc</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="image" className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="image">Bike Image</Label>
                                        <div 
                                            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition"
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.add('bg-muted/50');
                                            }}
                                            onDragLeave={(e) => {
                                                e.currentTarget.classList.remove('bg-muted/50');
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.remove('bg-muted/50');
                                                const files = e.dataTransfer.files;
                                                if (files && files[0]) {
                                                    const file = files[0];
                                                    setImageFile(file);
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setImagePreview(reader.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        >
                                            <input
                                                id="image"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageSelect}
                                            />
                                            <label htmlFor="image" className="cursor-pointer flex flex-col items-center gap-2">
                                                {imagePreview && !imagePreview.startsWith('data:') ? (
                                                    <>
                                                        <img src={imagePreview} alt="preview" className="h-32 w-32 object-cover rounded" />
                                                        <span className="text-sm text-muted-foreground">Click to change image</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                                        <span className="text-sm font-medium">Click to upload or drag and drop</span>
                                                        <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <DialogFooter className="mt-8">
                                <Button variant="outline" type="button" onClick={() => {
                                    setIsAddDialogOpen(false);
                                    resetForm();
                                }} disabled={submitting}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" /> {editingId ? "Update" : "Create"} Bike
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or brand..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {BIKE_CATEGORIES.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">Image</TableHead>
                                        <TableHead>Bike Model</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Base Price</TableHead>
                                        <TableHead>Engine</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBikes.map((bike) => (
                                        <TableRow key={bike.id}>
                                            <TableCell>
                                                <div className="h-12 w-16 rounded overflow-hidden bg-muted">
                                                    {bike.image_url ? (
                                                        <img
                                                            src={bike.image_url}
                                                            alt={bike.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <Bike className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{bike.name}</div>
                                                <div className="text-xs text-muted-foreground">{bike.brand}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {bike.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatPrice(bike.price)}</TableCell>
                                            <TableCell className="text-sm">
                                                {bike.engine_cc}cc {bike.fuel_type}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" disabled={deletingId === bike.id}>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleEdit(bike)}>
                                                            <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDuplicate(bike)}>
                                                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => handleDelete(bike.id)}
                                                        >
                                                            {deletingId === bike.id ? (
                                                                <>
                                                                    <Loader className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Model
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredBikes.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                    <Bike className="h-8 w-8 mb-2 opacity-20" />
                                                    <p>{bikes.length === 0 ? "No bikes yet. Create the first one!" : "No bikes found matching your filters."}</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
