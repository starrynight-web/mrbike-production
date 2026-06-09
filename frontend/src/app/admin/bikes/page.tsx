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
  PlusCircle,
  X,
  Database,
  FileJson,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { BIKE_CATEGORIES } from "@/config/constants";
import { adminAPI, Bike as BikeType } from "@/lib/admin-api";

interface Brand {
  id: number;
  name: string;
  logo_url?: string;
}

// Default structure for a variant
const defaultVariant = () => ({
  variant_name: "Standard",
  variant_key: "std",
  price: 0,
  is_default: true,
  braking_system: "",
  rear_brake_type: "",
  tire_type: "Tubeless",
  headlight_type: "",
  kerb_weight: "",
  seat_type: "",
  instrument_console: "",
  mileage_company: "",
  mileage_user: "",
  topspeed_company: "",
  topspeed_user: "",
  color_options: [] as string[],
  mobile_connectivity: false,
  gps_navigation: false,
  riding_modes: false,
  slipper_clutch: false,
  traction_control: false,
  quick_shifter: false,
});

export default function AdminBikesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  
  const queryClient = useQueryClient();

  const { data: brands = [], isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ["admin", "brands"],
    queryFn: async () => {
      const data = await adminAPI.getAllBrands();
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: bikes = [], isLoading: bikesLoading } = useQuery<BikeType[]>({
    queryKey: ["admin", "bikes"],
    queryFn: async () => {
      const response = await adminAPI.getAllBikes({ limit: 100, offset: 0 });
      return response?.results || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [importing, setImporting] = useState(false);
  const [newBrandData, setNewBrandData] = useState({ name: "", description: "" });
  const [creatingBrand, setCreatingBrand] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [variants, setVariants] = useState<ReturnType<typeof defaultVariant>[]>([defaultVariant()]);

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
    image1: "",
    image2: "",
    image3: "",
    image4: "",
    image5: "",
    detailed_specs: {
      engine_type: "",
      displacement: "",
      max_power: "",
      max_torque: "",
      bore_stroke: "",
      compression_ratio: "",
      fuel_system: "",
      starting: "",
      cooling_system: "",
      valve_train: "",
      emission_standard: "",
      acceleration_0_60: "",
      acceleration_0_100: "",
      top_speed: "",
      mileage_city: "",
      mileage_highway: "",
      fuel_type: "petrol",
      fuel_tank_capacity: "",
      reserve_fuel: "",
      range_per_tank: "",
      clutch: "",
      gearbox: "",
      gear_pattern: "",
      final_drive: "",
      brakes_front: "",
      brakes_rear: "",
      braking_system: "",
      length: "",
      width: "",
      height: "",
      wheelbase: "",
      ground_clearance: "",
      seat_height: "",
      frame_type: "",
      suspension_front: "",
      suspension_rear: "",
      kerb_weight: "",
      dry_weight: "",
      payload_capacity: "",
      tyres_front: "",
      tyres_rear: "",
      tyres_type: "tubeless",
      wheels_front: "",
      wheels_rear: "",
      gear_shift_pattern: "",
      spark_plugs: 1,
      cooling_type: "",
      usb_charging: false,
      side_stand_cut_off: false,
      projector_headlight: false,
      drls: false,
      gear_indicator: false,
      distance_to_empty: false,
      avg_fuel_consumption: false,
    } as any,
  });



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

      // Build FormData — same pattern as the News module for reliable Cloudinary uploads
      const formData = new FormData();
      formData.append("name", newBike.name);
      formData.append("brand", String(Number(newBike.brand)));
      formData.append("category", newBike.category);
      formData.append("price", String(Number(newBike.price)));
      formData.append("engine_capacity", String(Number(newBike.engine_capacity)));
      formData.append("engine_type", newBike.engine_type || "");
      formData.append("gears", String(newBike.gears || 5));
      formData.append("clutch_type", newBike.clutch_type || "");
      formData.append("curb_weight", String(newBike.curb_weight || 0));
      formData.append("fuel_capacity", String(newBike.fuel_capacity || 0));
      formData.append("seat_height", String(newBike.seat_height || 0));
      formData.append("tyre_type", newBike.tyre_type || "Tubeless");
      formData.append("is_available", String(newBike.is_available));
      if (newBike.description) formData.append("description", newBike.description);

      // Include image files if selected
      if (imageFile) {
        formData.append("primary_image", imageFile);
      } else if (newBike.primary_image) {
        formData.append("primary_image", newBike.primary_image);
      }
      ["image1", "image2", "image3", "image4", "image5"].forEach((key) => {
        const val = (newBike as any)[key];
        if (val) formData.append(key, val);
      });

      // JSON-encode detailed_specs
      formData.append("detailed_specs", JSON.stringify(newBike.detailed_specs));

      // JSON-encode variants
      formData.append("variants_data", JSON.stringify(variants.map((v, i) => ({
        ...v,
        is_default: i === 0,
        price: Number(v.price),
      }))));

      if (editingId) {
        await adminAPI.updateBike(editingId, formData as any);
        toast.success("Bike updated successfully");
        setIsAddDialogOpen(false);
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["admin", "bikes"] });
      } else {
        const res = await adminAPI.createBike(formData as any);
        if (res?.id) {
          toast.success("Bike created successfully");
          setIsAddDialogOpen(false);
          resetForm();
          queryClient.invalidateQueries({ queryKey: ["admin", "bikes"] });
        } else {
          throw new Error("Failed to create bike");
        }
      }
    } catch (error: any) {
      console.error("Failed to save bike:", error);
      toast.error(error?.message || (editingId ? "Failed to update bike" : "Failed to add bike"));
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
      image1: "",
      image2: "",
      image3: "",
      image4: "",
      image5: "",
      detailed_specs: {} as any,
    });
    setVariants([defaultVariant()]);
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
  };

  const handleEdit = (bike: BikeType & { variants?: any[] }) => {
    setNewBike({
      name: bike.name,
      brand: bike.brand ? (typeof bike.brand === 'object' && bike.brand !== null ? (bike.brand as { id: number }).id.toString() : bike.brand.toString()) : "",
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
      image1: bike.image1 || "",
      image2: bike.image2 || "",
      image3: bike.image3 || "",
      image4: bike.image4 || "",
      image5: bike.image5 || "",
      detailed_specs: bike.detailed_specs || {} as any,
    });
    // Load existing variants
    if (bike.variants && bike.variants.length > 0) {
      setVariants(bike.variants.map((v: any) => ({
        variant_name: v.variant_name || "Standard",
        variant_key: v.variant_key || "std",
        price: Number(v.price) || 0,
        is_default: v.is_default ?? false,
        braking_system: v.braking_system || "",
        rear_brake_type: v.rear_brake_type || "",
        tire_type: v.tire_type || "Tubeless",
        headlight_type: v.headlight_type || "",
        kerb_weight: v.kerb_weight || "",
        seat_type: v.seat_type || "",
        instrument_console: v.instrument_console || "",
        mileage_company: v.mileage_company || "",
        mileage_user: v.mileage_user || "",
        topspeed_company: v.topspeed_company || "",
        topspeed_user: v.topspeed_user || "",
        color_options: v.color_options || [],
        mobile_connectivity: !!v.mobile_connectivity,
        gps_navigation: !!v.gps_navigation,
        riding_modes: !!v.riding_modes,
        slipper_clutch: !!v.slipper_clutch,
        traction_control: !!v.traction_control,
        quick_shifter: !!v.quick_shifter,
      })));
    } else {
      setVariants([defaultVariant()]);
    }
    setImagePreview(bike.primary_image || "");
    setEditingId(bike.id);
    setIsAddDialogOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminAPI.deleteBike(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "bikes"] });
      const prevBikes = queryClient.getQueryData<BikeType[]>(["admin", "bikes"]);
      queryClient.setQueryData<BikeType[]>(["admin", "bikes"], (old) => 
        (old || []).filter((b) => b.id !== id)
      );
      setDeletingId(id);
      return { prevBikes };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["admin", "bikes"], context?.prevBikes);
      toast.error("Failed to delete bike");
      console.error("Failed to delete bike:", err);
    },
    onSuccess: () => {
      toast.success("Bike model deleted successfully");
    },
    onSettled: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "bikes"] });
    }
  });

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this bike model?")) return;
    deleteMutation.mutate(id);
  };

  const handleDuplicate = async (bike: BikeType) => {
    try {
      await adminAPI.duplicateBike(bike.id);
      toast.success("Bike model duplicated as draft");
      queryClient.invalidateQueries({ queryKey: ["admin", "bikes"] });
    } catch (error) {
      console.error("Failed to duplicate bike:", error);
      toast.error("Failed to duplicate bike");
    }
  };

  const filteredBikes = bikes.filter((bike) => {
    const brandIdStr = bike.brand ? (typeof bike.brand === 'object' && bike.brand !== null ? (bike.brand as any).id?.toString() : bike.brand.toString()) : "";
    const bikeBrand = (typeof bike.brand === 'object' && bike.brand !== null)
      ? ((bike.brand as { name?: string })?.name || "")
      : (brands.find(b => b.id.toString() === brandIdStr)?.name || "");
    const matchesSearch =
      (bike.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bikeBrand || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || bike.category === categoryFilter;
    const matchesBrand = 
      brandFilter === "all" || brandIdStr === brandFilter;
    return matchesSearch && matchesCategory && matchesBrand;
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
          {/* Add Brand Dialog */}
          <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <Database className="mr-2 h-4 w-4" /> Add Brand
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Brand</DialogTitle>
                <DialogDescription>Create a new manufacturer brand for the database.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Brand Name</Label>
                  <Input 
                    placeholder="e.g. Yamaha" 
                    value={newBrandData.name}
                    onChange={e => setNewBrandData({...newBrandData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea 
                    placeholder="Brief history or details..." 
                    value={newBrandData.description}
                    onChange={e => setNewBrandData({...newBrandData, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBrandDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={async () => {
                    try {
                      setCreatingBrand(true);
                      await adminAPI.createBrand(newBrandData as any);
                      toast.success("Brand created successfully");
                      queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });
                      setIsBrandDialogOpen(false);
                      setNewBrandData({ name: "", description: "" });
                    } catch (e: any) {
                      toast.error(e.message || "Failed to create brand");
                    } finally {
                      setCreatingBrand(false);
                    }
                  }}
                  disabled={creatingBrand || !newBrandData.name}
                >
                  {creatingBrand && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  Create Brand
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Import JSON Dialog */}
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="shrink-0">
                <FileJson className="mr-2 h-4 w-4" /> Import JSON
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import Bike Data</DialogTitle>
                <DialogDescription>Paste bike JSON data or upload a .json file to bulk import.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>JSON Content</Label>
                  <Textarea 
                    className="font-mono text-xs min-h-[300px]"
                    placeholder='{ "Bike Name": "Yamaha R15 V4", ... }'
                    value={jsonInput}
                    onChange={e => setJsonInput(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    type="file" 
                    accept=".json" 
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (re) => setJsonInput(re.target?.result as string);
                        reader.readAsText(file);
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={async () => {
                    try {
                      setImporting(true);
                      const parsed = JSON.parse(jsonInput);
                      const res = await adminAPI.importBikes(parsed);
                      if (res.errors && res.errors.length > 0) {
                        res.errors.forEach((err: string) => toast.error(err));
                      }
                      if (res.created > 0) {
                        toast.success(`Successfully imported ${res.created} bikes`);
                        queryClient.invalidateQueries({ queryKey: ["admin", "bikes"] });
                        queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });
                        setIsImportDialogOpen(false);
                        setJsonInput("");
                      }
                    } catch (e: any) {
                      toast.error("Invalid JSON format");
                    } finally {
                      setImporting(false);
                    }
                  }}
                  disabled={importing || !jsonInput}
                >
                  {importing && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  Start Import
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 h-auto">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="engine">Engine</TabsTrigger>
                  <TabsTrigger value="chassis">Chassis</TabsTrigger>
                  <TabsTrigger value="dims">Dimensions</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="variants">Variants</TabsTrigger>
                  <TabsTrigger value="image">Images</TabsTrigger>
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
                    <div className="space-y-2">
                      <Label htmlFor="top_speed">Top Speed</Label>
                      <Input
                        id="top_speed"
                        placeholder="e.g. 150 kmph"
                        value={newBike.detailed_specs?.top_speed || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, top_speed: e.target.value } 
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mileage_city">Mileage (City)</Label>
                      <Input
                        id="mileage_city"
                        placeholder="e.g. 40 kmpl"
                        value={newBike.detailed_specs?.mileage_city || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, mileage_city: e.target.value } 
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mileage_highway">Mileage (Highway)</Label>
                      <Input
                        id="mileage_highway"
                        placeholder="e.g. 45 kmpl"
                        value={newBike.detailed_specs?.mileage_highway || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, mileage_highway: e.target.value } 
                          })
                        }
                      />
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displacement">Displacement (CC)</Label>
                      <Input
                        id="displacement"
                        placeholder="e.g. 155 cc"
                        value={newBike.detailed_specs?.displacement || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, displacement: e.target.value } 
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="max_power">Max Power</Label>
                    <Input
                      id="max_power"
                      placeholder="e.g. 18.4 HP @ 10000 rpm"
                      value={newBike.detailed_specs?.max_power || ""}
                      onChange={(e) =>
                        setNewBike({ 
                          ...newBike, 
                          detailed_specs: { ...newBike.detailed_specs, max_power: e.target.value } 
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_torque">Max Torque</Label>
                    <Input
                      id="max_torque"
                      placeholder="e.g. 14.2 Nm @ 7500 rpm"
                      value={newBike.detailed_specs?.max_torque || ""}
                      onChange={(e) =>
                        setNewBike({ 
                          ...newBike, 
                          detailed_specs: { ...newBike.detailed_specs, max_torque: e.target.value } 
                        })
                      }
                    />
                  </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="engine_type_detail">Engine Type</Label>
                      <Input
                        id="engine_type_detail"
                        placeholder="e.g. Liquid-cooled, 4-stroke, SOHC"
                        value={newBike.detailed_specs?.engine_type || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, engine_type: e.target.value } 
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fuel_system">Fuel System</Label>
                      <Input
                        id="fuel_system"
                        placeholder="e.g. Fuel Injection"
                        value={newBike.detailed_specs?.fuel_system || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, fuel_system: e.target.value } 
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cooling">Cooling System</Label>
                      <Input
                        id="cooling"
                        placeholder="e.g. Liquid Cooled"
                        value={newBike.detailed_specs?.cooling_system || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, cooling_system: e.target.value } 
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gears">Gears</Label>
                      <Input
                        id="gears"
                        placeholder="e.g. 6-speed"
                        value={newBike.detailed_specs?.gearbox || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, gearbox: e.target.value } 
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clutch">Clutch</Label>
                      <Input
                        id="clutch"
                        placeholder="e.g. Wet Multi-plate"
                        value={newBike.detailed_specs?.clutch || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, clutch: e.target.value } 
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="starting">Starting</Label>
                      <Input
                        id="starting"
                        placeholder="e.g. Self Start"
                        value={newBike.detailed_specs?.starting || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, starting: e.target.value } 
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cooling_type">Cooling Type</Label>
                      <Input
                        id="cooling_type"
                        placeholder="e.g. Air Cooled"
                        value={newBike.detailed_specs?.cooling_type || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, cooling_type: e.target.value } 
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="spark_plugs">Spark Plugs</Label>
                      <Input
                        id="spark_plugs"
                        type="number"
                        placeholder="1"
                        value={newBike.detailed_specs?.spark_plugs || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, spark_plugs: Number(e.target.value) } 
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gear_pattern">Gear Shift Pattern</Label>
                      <Input
                        id="gear_pattern"
                        placeholder="e.g. 1-N-2-3-4-5"
                        value={newBike.detailed_specs?.gear_shift_pattern || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, gear_shift_pattern: e.target.value } 
                          })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="chassis" className="space-y-4 pt-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brakes_front">Front Brake</Label>
                      <Input
                        id="brakes_front"
                        placeholder="e.g. 282mm Disc"
                        value={newBike.detailed_specs?.brakes_front || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, brakes_front: e.target.value } 
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brakes_rear">Rear Brake</Label>
                      <Input
                        id="brakes_rear"
                        placeholder="e.g. 220mm Disc"
                        value={newBike.detailed_specs?.brakes_rear || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, brakes_rear: e.target.value } 
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="braking_system">Braking System</Label>
                      <Input
                        id="braking_system"
                        placeholder="e.g. Dual Channel ABS"
                        value={newBike.detailed_specs?.braking_system || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, braking_system: e.target.value } 
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tyres_front">Front Tyre</Label>
                      <Input
                        id="tyres_front"
                        placeholder="e.g. 100/80-17"
                        value={newBike.detailed_specs?.tyres_front || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, tyres_front: e.target.value } 
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tyres_rear">Rear Tyre</Label>
                      <Input
                        id="tyres_rear"
                        placeholder="e.g. 140/70-17"
                        value={newBike.detailed_specs?.tyres_rear || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, tyres_rear: e.target.value } 
                          })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: "usb_charging", label: "USB Charging" },
                      { id: "side_stand_cut_off", label: "Side Stand Cut-off" },
                      { id: "projector_headlight", label: "Projector Headlight" },
                      { id: "drls", label: "DRLs" },
                      { id: "gear_indicator", label: "Gear Indicator" },
                      { id: "distance_to_empty", label: "Distance to Empty" },
                      { id: "avg_fuel_consumption", label: "Avg Fuel Consumption" },
                    ].map((feature) => (
                      <div key={feature.id} className="flex items-center space-x-2 border p-3 rounded-lg">
                        <Checkbox 
                          id={feature.id} 
                          checked={newBike.detailed_specs?.[feature.id] || false}
                          onCheckedChange={(checked) => 
                            setNewBike({
                              ...newBike,
                              detailed_specs: {
                                ...newBike.detailed_specs,
                                [feature.id]: !!checked
                              }
                            })
                          }
                        />
                        <Label htmlFor={feature.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {feature.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="dims" className="space-y-4 pt-4">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="kerb_weight">Kerb Weight</Label>
                      <Input
                        id="kerb_weight"
                        placeholder="e.g. 142 kg"
                        value={newBike.detailed_specs?.kerb_weight || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, kerb_weight: e.target.value } 
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fuel_capacity_spec">Fuel capacity</Label>
                      <Input
                        id="fuel_capacity_spec"
                        placeholder="e.g. 11 L"
                        value={newBike.detailed_specs?.fuel_tank_capacity || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, fuel_tank_capacity: e.target.value } 
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seat_height_spec">Seat Height</Label>
                      <Input
                        id="seat_height_spec"
                        placeholder="e.g. 815 mm"
                        value={newBike.detailed_specs?.seat_height || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, seat_height: e.target.value } 
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ground_clearance">Ground Clearance</Label>
                      <Input
                        id="ground_clearance"
                        placeholder="e.g. 170 mm"
                        value={newBike.detailed_specs?.ground_clearance || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, ground_clearance: e.target.value } 
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wheelbase">Wheelbase</Label>
                      <Input
                        id="wheelbase"
                        placeholder="e.g. 1325 mm"
                        value={newBike.detailed_specs?.wheelbase || ""}
                        onChange={(e) =>
                          setNewBike({ 
                            ...newBike, 
                            detailed_specs: { ...newBike.detailed_specs, wheelbase: e.target.value } 
                          })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="variants" className="space-y-4 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">Variants ({variants.length})</p>
                      <p className="text-xs text-muted-foreground">Each variant can have different specs and pricing.</p>
                    </div>
                    {variants.length < 4 && (
                      <Button type="button" size="sm" variant="outline"
                        onClick={() => setVariants(prev => [...prev, { ...defaultVariant(), variant_name: `Variant ${prev.length + 1}`, variant_key: `v${prev.length + 1}`, is_default: false }])}
                      >
                        <PlusCircle className="h-4 w-4 mr-1" /> Add Variant
                      </Button>
                    )}
                  </div>

                  {variants.map((variant, idx) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">
                          {idx === 0 ? "Default Variant" : `Variant ${idx + 1}`}
                          {idx === 0 && <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">Default</span>}
                        </h4>
                        {idx > 0 && (
                          <Button type="button" size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0"
                            onClick={() => setVariants(prev => prev.filter((_, i) => i !== idx))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {/* Identity */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Variant Name *</Label>
                          <Input value={variant.variant_name}
                            onChange={e => setVariants(prev => prev.map((v, i) => i === idx ? {...v, variant_name: e.target.value} : v))}
                            placeholder="e.g. ABS" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Variant Key</Label>
                          <Input value={variant.variant_key}
                            onChange={e => setVariants(prev => prev.map((v, i) => i === idx ? {...v, variant_key: e.target.value} : v))}
                            placeholder="e.g. abs" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Price (BDT) *</Label>
                          <Input type="number" value={variant.price}
                            onChange={e => setVariants(prev => prev.map((v, i) => i === idx ? {...v, price: Number(e.target.value)} : v))}
                            placeholder="0" />
                        </div>
                      </div>
                      {/* Performance */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Top Speed (Company Claimed)</Label>
                          <Input value={variant.topspeed_company}
                            onChange={e => setVariants(prev => prev.map((v, i) => i === idx ? {...v, topspeed_company: e.target.value} : v))}
                            placeholder="e.g. 135 kmph" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Top Speed (User Claimed)</Label>
                          <Input value={variant.topspeed_user}
                            onChange={e => setVariants(prev => prev.map((v, i) => i === idx ? {...v, topspeed_user: e.target.value} : v))}
                            placeholder="e.g. 128 kmph" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Mileage (Company Claimed)</Label>
                          <Input value={variant.mileage_company}
                            onChange={e => setVariants(prev => prev.map((v, i) => i === idx ? {...v, mileage_company: e.target.value} : v))}
                            placeholder="e.g. 45 kmpl" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Mileage (User Claimed)</Label>
                          <Input value={variant.mileage_user}
                            onChange={e => setVariants(prev => prev.map((v, i) => i === idx ? {...v, mileage_user: e.target.value} : v))}
                            placeholder="e.g. 40 kmpl" />
                        </div>
                      </div>
                      {/* Brakes & Wheels */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Braking System</Label>
                          <Input value={variant.braking_system}
                            onChange={e => setVariants(prev => prev.map((v, i) => i === idx ? {...v, braking_system: e.target.value} : v))}
                            placeholder="e.g. Disc / Drum, ABS" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Rear Brake Type</Label>
                          <Input value={variant.rear_brake_type}
                            onChange={e => setVariants(prev => prev.map((v, i) => i === idx ? {...v, rear_brake_type: e.target.value} : v))}
                            placeholder="e.g. 130mm Drum" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tyre Type</Label>
                          <Input value={variant.tire_type}
                            onChange={e => setVariants(prev => prev.map((v, i) => i === idx ? {...v, tire_type: e.target.value} : v))}
                            placeholder="e.g. Tubeless" />
                        </div>
                      </div>
                      {/* Other specs */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Headlight Type</Label>
                          <Input value={variant.headlight_type}
                            onChange={e => setVariants(prev => prev.map((v, i) => i === idx ? {...v, headlight_type: e.target.value} : v))}
                            placeholder="e.g. LED Projector" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Kerb Weight</Label>
                          <Input value={variant.kerb_weight}
                            onChange={e => setVariants(prev => prev.map((v, i) => i === idx ? {...v, kerb_weight: e.target.value} : v))}
                            placeholder="e.g. 140 kg" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Instrument Console</Label>
                          <Input value={variant.instrument_console}
                            onChange={e => setVariants(prev => prev.map((v, i) => i === idx ? {...v, instrument_console: e.target.value} : v))}
                            placeholder="e.g. TFT Digital" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Seat Type</Label>
                          <Input value={variant.seat_type}
                            onChange={e => setVariants(prev => prev.map((v, i) => i === idx ? {...v, seat_type: e.target.value} : v))}
                            placeholder="e.g. Split Seat" />
                        </div>
                      </div>
                      {/* Feature flags */}
                      <div>
                        <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Features</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {[
                            { key: "mobile_connectivity", label: "Mobile Phone Connectivity" },
                            { key: "gps_navigation", label: "GPS & Navigation" },
                            { key: "riding_modes", label: "Riding Modes" },
                            { key: "slipper_clutch", label: "Slipper / Assist Clutch" },
                            { key: "traction_control", label: "Traction Control" },
                            { key: "quick_shifter", label: "Quick Shifter" },
                          ].map(feat => (
                            <div key={feat.key} className="flex items-center gap-2">
                              <Checkbox id={`${feat.key}-${idx}`}
                                checked={!!(variant as any)[feat.key]}
                                onCheckedChange={checked => setVariants(prev => prev.map((v, i) => i === idx ? {...v, [feat.key]: !!checked} : v))}
                              />
                              <Label htmlFor={`${feat.key}-${idx}`} className="text-xs">{feat.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="image" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Primary Image */}
                    <div className="space-y-2">
                      <Label>Primary Image *</Label>
                      <ImageUploadSlot
                        id="primary_image"
                        preview={imagePreview || newBike.primary_image}
                        onUpload={async (file) => {
                          const res = await adminAPI.uploadImage(file);
                          if (res?.url) {
                            setNewBike(prev => ({ ...prev, primary_image: res.url }));
                            setImagePreview(res.url);
                          }
                        }}
                      />
                    </div>
                    {/* Image 1 */}
                    <div className="space-y-2">
                      <Label>Image 1</Label>
                      <ImageUploadSlot
                        id="image1"
                        preview={newBike.image1}
                        onUpload={async (file) => {
                          const res = await adminAPI.uploadImage(file);
                          if (res?.url) {
                            setNewBike(prev => ({ ...prev, image1: res.url }));
                          }
                        }}
                      />
                    </div>
                    {/* Image 2 */}
                    <div className="space-y-2">
                      <Label>Image 2</Label>
                      <ImageUploadSlot
                        id="image2"
                        preview={newBike.image2}
                        onUpload={async (file) => {
                          const res = await adminAPI.uploadImage(file);
                          if (res?.url) {
                            setNewBike(prev => ({ ...prev, image2: res.url }));
                          }
                        }}
                      />
                    </div>
                    {/* Image 3 */}
                    <div className="space-y-2">
                      <Label>Image 3</Label>
                      <ImageUploadSlot
                        id="image3"
                        preview={newBike.image3}
                        onUpload={async (file) => {
                          const res = await adminAPI.uploadImage(file);
                          if (res?.url) {
                            setNewBike(prev => ({ ...prev, image3: res.url }));
                          }
                        }}
                      />
                    </div>
                    {/* Image 4 */}
                    <div className="space-y-2">
                      <Label>Image 4</Label>
                      <ImageUploadSlot
                        id="image4"
                        preview={newBike.image4}
                        onUpload={async (file) => {
                          const res = await adminAPI.uploadImage(file);
                          if (res?.url) {
                            setNewBike(prev => ({ ...prev, image4: res.url }));
                          }
                        }}
                      />
                    </div>
                    {/* Image 5 */}
                    <div className="space-y-2">
                      <Label>Image 5</Label>
                      <ImageUploadSlot
                        id="image5"
                        preview={newBike.image5}
                        onUpload={async (file) => {
                          const res = await adminAPI.uploadImage(file);
                          if (res?.url) {
                            setNewBike(prev => ({ ...prev, image5: res.url }));
                          }
                        }}
                      />
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
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-full md:w-45">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          {bikesLoading ? (
            <div className="space-y-4 pt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-16 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
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
                          {bike.brand_name || 
                            (typeof bike.brand === 'object' && bike.brand !== null
                              ? (bike.brand as { name: string }).name 
                              : (bike.brand ? brands.find(b => b.id.toString() === bike.brand.toString())?.name : "")) || 
                            'Unknown Brand'}
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
                        <TooltipProvider>
                          <DropdownMenu>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Manage Bike</p>
                              </TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEdit(bike)}
                              >
                                <Edit2 className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicate(bike)}
                              >
                                <Copy className="mr-2 h-4 w-4" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(bike.id)}
                                className="text-destructive focus:text-destructive"
                                disabled={deletingId === bike.id}
                              >
                                {deletingId === bike.id ? (
                                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Delete Model
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipProvider>
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

function ImageUploadSlot({ 
  id, 
  preview, 
  onUpload 
}: { 
  id: string, 
  preview?: string, 
  onUpload: (file: File) => Promise<void> 
}) {
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploading(true);
        await onUpload(file);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload image");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition group">
      {preview ? (
        <div className="relative w-full h-full">
           <Image
            src={preview}
            alt="preview"
            fill
            className="object-cover"
            unoptimized
          />
          <label 
            htmlFor={id} 
            className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-medium"
          >
            Change Image
          </label>
          {uploading && (
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
               <Loader className="h-6 w-6 text-white animate-spin" />
             </div>
          )}
        </div>
      ) : (
        <label htmlFor={id} className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center w-full h-full justify-center">
          {uploading ? (
            <Loader className="h-8 w-8 text-muted-foreground animate-spin" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Click to upload</span>
            </>
          )}
        </label>
      )}
      <input
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={uploading}
      />
    </div>
  );
}
