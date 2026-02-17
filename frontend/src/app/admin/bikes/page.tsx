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
import { adminAPI, Bike as BikeType } from "@/lib/admin-api";

interface Brand {
  id: number;
  name: string;
  logo_url?: string;
}

export default function AdminBikesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [bikes, setBikes] = useState<BikeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [newBike, setNewBike] = useState({
    name: "",
    brand: "",
    category: "commuter",
    price: 0,
    description: "",
    engine_capacity: 0,
    engine_type: "petrol",
    gears: 5,
    clutch_type: "wet",
    curb_weight: 0,
    fuel_capacity: 0,
    seat_height: 0,
    tyre_type: "tubeless",
    is_available: true,
    primary_image: "",
  });

  useEffect(() => {
    loadBikes();
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const data = await adminAPI.getAllBrands();
      setBrands(data || []);
    } catch {
      console.error("Failed to load brands");
    }
  };

  const loadBikes = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllBikes({
        limit: 100,
        offset: 0,
      });
      setBikes(response?.results || []);
    } catch {
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

      let imageUrl = newBike.primary_image || imagePreview;

      // Upload image if provided
      if (imageFile && !imageFile.name?.startsWith("data:")) {
        try {
          const uploadResult = await adminAPI.uploadImage(imageFile);
          imageUrl = uploadResult.url;
        } catch {
          toast.error("Failed to upload image");
          return;
        }
      }

      const bikeData = {
        ...newBike,
        price: Number(newBike.price),
        primary_image: imageUrl,
        brand: Number(newBike.brand), // Ensure brand is an ID
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
      engine_capacity: 0,
      engine_type: "petrol",
      gears: 5,
      clutch_type: "wet",
      curb_weight: 0,
      fuel_capacity: 0,
      seat_height: 0,
      tyre_type: "tubeless",
      is_available: true,
      primary_image: "",
    });
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
  };

  const handleEdit = (bike: BikeType) => {
    setNewBike({
      name: bike.name,
      brand: (typeof bike.brand === 'object' ? (bike.brand as { id: number }).id.toString() : bike.brand.toString()),
      category: bike.category,
      price: bike.price,
      description: bike.description || "",
      engine_capacity: bike.engine_capacity || 0,
      engine_type: bike.engine_type || "petrol",
      gears: bike.gears || 5,
      clutch_type: bike.clutch_type || "wet",
      curb_weight: bike.curb_weight || 0,
      fuel_capacity: bike.fuel_capacity || 0,
      seat_height: bike.seat_height || 0,
      tyre_type: bike.tyre_type || "tubeless",
      is_available: bike.is_available ?? true,
      primary_image: bike.primary_image || "",
    });
    setImagePreview(bike.primary_image || "");
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

  const handleDuplicate = async (bike: BikeType) => {
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
    const bikeBrand = (typeof bike.brand === 'object' ? (bike.brand as { name: string }).name : (brands.find(b => b.id.toString() === bike.brand.toString())?.name || ""));
    const matchesSearch =
      bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bikeBrand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || bike.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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

        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" /> Add New Bike
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleAddBike}>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Bike Model" : "Add Official Bike Model"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Update bike specifications."
                    : "Create a new entry in the official bike database."}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="basic" className="mt-6">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="engine">Engine & Performance</TabsTrigger>
                  <TabsTrigger value="image">Image</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Bike Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g. Yamaha R15 V4"
                        required
                        value={newBike.name}
                        onChange={(e) =>
                          setNewBike({ ...newBike, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand *</Label>
                      <Select
                        value={newBike.brand}
                        onValueChange={(v) =>
                          setNewBike({ ...newBike, brand: v })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id.toString()}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={newBike.category}
                        onValueChange={(v) =>
                          setNewBike({ ...newBike, category: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BIKE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
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
                        onChange={(e) =>
                          setNewBike({
                            ...newBike,
                            price: Number(e.target.value),
                          })
                        }
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
                      onChange={(e) =>
                        setNewBike({ ...newBike, description: e.target.value })
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="engine" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="engine_capacity">Engine (CC) *</Label>
                      <Input
                        id="engine_capacity"
                        type="number"
                        placeholder="e.g. 155"
                        required
                        value={newBike.engine_capacity || ""}
                        onChange={(e) =>
                          setNewBike({
                            ...newBike,
                            engine_capacity: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="engine_type">Engine Type</Label>
                      <Input
                        id="engine_type"
                        placeholder="e.g. Single Cylinder, 4-Stroke"
                        value={newBike.engine_type}
                        onChange={(e) =>
                          setNewBike({ ...newBike, engine_type: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gears">Number of Gears</Label>
                      <Input
                        id="gears"
                        type="number"
                        value={newBike.gears}
                        onChange={(e) =>
                          setNewBike({ ...newBike, gears: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clutch_type">Clutch Type</Label>
                      <Input
                        id="clutch_type"
                        placeholder="e.g. Wet Multi-plate"
                        value={newBike.clutch_type}
                        onChange={(e) =>
                          setNewBike({ ...newBike, clutch_type: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="curb_weight">Body Weight (kg)</Label>
                      <Input
                        id="curb_weight"
                        type="number"
                        value={newBike.curb_weight}
                        onChange={(e) =>
                          setNewBike({ ...newBike, curb_weight: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fuel_capacity">Fuel Capacity (L)</Label>
                      <Input
                        id="fuel_capacity"
                        type="number"
                        value={newBike.fuel_capacity}
                        onChange={(e) =>
                          setNewBike({ ...newBike, fuel_capacity: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seat_height">Seat Height (mm)</Label>
                      <Input
                        id="seat_height"
                        type="number"
                        value={newBike.seat_height}
                        onChange={(e) =>
                          setNewBike({ ...newBike, seat_height: Number(e.target.value) })
                        }
                      />
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
                        e.currentTarget.classList.add("bg-muted/50");
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove("bg-muted/50");
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove("bg-muted/50");
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
                      <label
                        htmlFor="image"
                        className="cursor-pointer flex flex-col items-center gap-2 w-full"
                      >
                        {imagePreview ? (
                          <>
                            <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden bg-muted">
                              <Image
                                src={imagePreview}
                                alt="preview"
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              Click to change image
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              Click to upload or drag and drop
                            </span>
                            <span className="text-xs text-muted-foreground">
                              PNG, JPG up to 5MB
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-8">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />{" "}
                      {editingId ? "Update" : "Create"} Bike
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
                <SelectTrigger className="w-full md:w-45">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {BIKE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
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
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Image</TableHead>
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
                        <div className="h-12 w-16 rounded overflow-hidden bg-muted relative">
                          {bike.primary_image ? (
                            <Image
                              src={bike.primary_image}
                              alt={bike.name}
                              fill
                              className="object-cover"
                              unoptimized
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
                        <div className="text-xs text-muted-foreground">
                          {bike.brand_name || (typeof bike.brand === 'object' ? (bike.brand as { name: string }).name : brands.find(b => b.id.toString() === bike.brand.toString())?.name) || 'Unknown Brand'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {bike.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatPrice(bike.price)}</TableCell>
                      <TableCell className="text-sm">
                        {bike.engine_capacity}cc {bike.engine_type}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={deletingId === bike.id}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(bike)}>
                              <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(bike)}
                            >
                              <Copy className="mr-2 h-4 w-4" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(bike.id)}
                            >
                              {deletingId === bike.id ? (
                                <>
                                  <Loader className="mr-2 h-4 w-4 animate-spin" />{" "}
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  Model
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
                          <p>
                            {bikes.length === 0
                              ? "No bikes yet. Create the first one!"
                              : "No bikes found matching your filters."}
                          </p>
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
