"use client";

import { useState } from "react";
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
    ChevronDown,
    Save
} from "lucide-react";
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
    DialogTrigger
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Mock Data for Official Bikes
const mockBikes = [
    {
        id: "1",
        name: "Yamaha R15 V4",
        brand: "Yamaha",
        category: "sport",
        price: 495000,
        status: "published",
        views: 12500,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1622185135505-2d795003994a?q=80&w=200&auto=format&fit=crop"
    },
    {
        id: "2",
        name: "Honda CB150R",
        brand: "Honda",
        category: "naked",
        price: 530000,
        status: "published",
        views: 8900,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=200&auto=format&fit=crop"
    },
    {
        id: "3",
        name: "Suzuki Gixxer SF",
        brand: "Suzuki",
        category: "sport",
        price: 349000,
        status: "draft",
        views: 4500,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1568772585407-9363f9bf3a87?q=80&w=200&auto=format&fit=crop"
    },
    {
        id: "4",
        name: "TVS Apache RTR 160",
        brand: "TVS",
        category: "commuter",
        price: 195000,
        status: "published",
        views: 21000,
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=200&auto=format&fit=crop"
    }
];

export default function AdminBikesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [bikes, setBikes] = useState(mockBikes);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newBike, setNewBike] = useState({
        name: "",
        brand: "",
        category: "commuter",
        price: 0,
        description: "",
        engineType: "",
        displacement: 0,
        maxPower: "",
        maxTorque: "",
        mileage: 0,
        topSpeed: 0,
        abs: "None"
    });

    const handleAddBike = (e: React.FormEvent) => {
        e.preventDefault();
        const bikeToAdd = {
            id: Date.now().toString(),
            name: newBike.name,
            brand: newBike.brand,
            category: newBike.category as any,
            price: Number(newBike.price),
            status: "draft" as const,
            views: 0,
            rating: 0,
            image: "https://images.unsplash.com/photo-1622185135505-2d795003994a?q=80&w=200&auto=format&fit=crop"
        };
        setBikes([bikeToAdd, ...bikes]);
        setIsAddDialogOpen(false);
        toast.success("New bike model added as draft");
        setNewBike({
            name: "",
            brand: "",
            category: "commuter",
            price: 0,
            description: "",
            engineType: "",
            displacement: 0,
            maxPower: "",
            maxTorque: "",
            mileage: 0,
            topSpeed: 0,
            abs: "None"
        });
    };

    const filteredBikes = bikes.filter(bike => {
        const matchesSearch = bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bike.brand.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || bike.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this bike model?")) {
            setBikes(bikes.filter(b => b.id !== id));
            toast.success("Bike model deleted successfully");
        }
    };

    const handleDuplicate = (id: string) => {
        const bikeToDuplicate = bikes.find(b => b.id === id);
        if (bikeToDuplicate) {
            const newBike = {
                ...bikeToDuplicate,
                id: Date.now().toString(),
                name: `${bikeToDuplicate.name} (Copy)`,
                status: "draft" as const
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
                        Manage the database of official motorcycle models available in Bangladesh.
                    </p>
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="shrink-0">
                            <Plus className="mr-2 h-4 w-4" /> Add New Bike
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleAddBike}>
                            <DialogHeader>
                                <DialogTitle>Add Official Bike Model</DialogTitle>
                                <DialogDescription>
                                    Create a new entry in the official bike database. Fill in all specifications carefully for SEO.
                                </DialogDescription>
                            </DialogHeader>

                            <Tabs defaultValue="basic" className="mt-6">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                    <TabsTrigger value="engine">Engine & Performance</TabsTrigger>
                                    <TabsTrigger value="chassis">Chassis & Safety</TabsTrigger>
                                </TabsList>

                                <TabsContent value="basic" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Bike Name</Label>
                                            <Input
                                                id="name"
                                                placeholder="e.g. Yamaha R15 V4"
                                                required
                                                value={newBike.name}
                                                onChange={e => setNewBike({ ...newBike, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="brand">Brand</Label>
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
                                            <Label htmlFor="category">Category</Label>
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
                                            <Label htmlFor="price">Base Price (BDT)</Label>
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
                                        <Label htmlFor="description">Short Description</Label>
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
                                            <Label htmlFor="engineType">Engine Type</Label>
                                            <Input
                                                id="engineType"
                                                placeholder="e.g. Liquid-cooled, 4-stroke, SOHC, 4-valve"
                                                value={newBike.engineType}
                                                onChange={e => setNewBike({ ...newBike, engineType: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="displacement">Displacement (CC)</Label>
                                            <Input
                                                id="displacement"
                                                type="number"
                                                placeholder="e.g. 155"
                                                value={newBike.displacement || ""}
                                                onChange={e => setNewBike({ ...newBike, displacement: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="maxPower">Max Power</Label>
                                            <Input
                                                id="maxPower"
                                                placeholder="e.g. 18.4 PS @ 10000 RPM"
                                                value={newBike.maxPower}
                                                onChange={e => setNewBike({ ...newBike, maxPower: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="maxTorque">Max Torque</Label>
                                            <Input
                                                id="maxTorque"
                                                placeholder="e.g. 14.2 Nm @ 7500 RPM"
                                                value={newBike.maxTorque}
                                                onChange={e => setNewBike({ ...newBike, maxTorque: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="mileage">Expected Mileage (kmpl)</Label>
                                            <Input
                                                id="mileage"
                                                type="number"
                                                placeholder="e.g. 45"
                                                value={newBike.mileage || ""}
                                                onChange={e => setNewBike({ ...newBike, mileage: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="topSpeed">Top Speed (kmph)</Label>
                                            <Input
                                                id="topSpeed"
                                                type="number"
                                                placeholder="e.g. 140"
                                                value={newBike.topSpeed || ""}
                                                onChange={e => setNewBike({ ...newBike, topSpeed: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="chassis" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="abs">ABS Type</Label>
                                            <Select
                                                value={newBike.abs}
                                                onValueChange={v => setNewBike({ ...newBike, abs: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="None">None</SelectItem>
                                                    <SelectItem value="Single Channel">Single Channel</SelectItem>
                                                    <SelectItem value="Dual Channel">Dual Channel</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                                        <p>Additional technical specifications like dimensions, weight, and tyre sizes can be added later in the full editor.</p>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <DialogFooter className="mt-8">
                                <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    <Save className="mr-2 h-4 w-4" /> Save Bike Model
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
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Image</TableHead>
                                    <TableHead>Bike Model</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Base Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Views</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBikes.map((bike) => (
                                    <TableRow key={bike.id}>
                                        <TableCell>
                                            <div className="h-12 w-16 rounded overflow-hidden bg-muted">
                                                <img
                                                    src={bike.image}
                                                    alt={bike.name}
                                                    className="h-full w-full object-cover"
                                                />
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
                                        <TableCell>
                                            <Badge variant={bike.status === "published" ? "default" : "secondary"}>
                                                {bike.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {bike.views.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDuplicate(bike.id)}>
                                                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <ExternalLink className="mr-2 h-4 w-4" /> View on Site
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDelete(bike.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Model
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredBikes.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <Bike className="h-8 w-8 mb-2 opacity-20" />
                                                <p>No official bikes found matching your filters.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
