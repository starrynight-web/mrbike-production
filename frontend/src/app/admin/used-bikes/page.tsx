"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Eye,
    MoreHorizontal,
    Bike,
    Calendar,
    MapPin,
    Tag,
    Users
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Mock Data
const initialAds = [
    {
        id: "UB-1001",
        bikeName: "Yamaha R15 V3",
        brand: "Yamaha",
        seller: "Karim Ahmed",
        price: 350000,
        year: 2021,
        location: "Dhaka",
        status: "pending",
        date: "2026-01-30",
        thumbnail: ""
    },
    {
        id: "UB-1002",
        bikeName: "Suzuki Gixxer SF",
        brand: "Suzuki",
        seller: "Sabbir Khan",
        price: 210000,
        year: 2022,
        location: "Chattogram",
        status: "pending",
        date: "2026-01-30",
        thumbnail: ""
    },
    {
        id: "UB-1003",
        bikeName: "Honda CBR 150R",
        brand: "Honda",
        seller: "Tanvir Hasan",
        price: 420000,
        year: 2020,
        location: "Dhaka",
        status: "approved",
        date: "2026-01-29",
        thumbnail: ""
    },
    {
        id: "UB-1004",
        bikeName: "TVS Apache RTR 160",
        brand: "TVS",
        seller: "Rahat Chowdhary",
        price: 165000,
        year: 2019,
        location: "Sylhet",
        status: "rejected",
        date: "2026-01-28",
        thumbnail: ""
    }
];

export default function UsedBikesModeration() {
    const [ads, setAds] = useState(initialAds);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const filteredAds = ads.filter(ad => {
        const matchesSearch = ad.bikeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ad.seller.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "all" || ad.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleApprove = (id: string) => {
        setAds(ads.map(ad => ad.id === id ? { ...ad, status: "approved" as const } : ad));
        toast.success(`Ad ${id} approved successfully`);
    };

    const handleReject = (id: string) => {
        setAds(ads.map(ad => ad.id === id ? { ...ad, status: "rejected" as const } : ad));
        toast.error(`Ad ${id} has been rejected`);
    };

    const handleDeleteListing = (id: string) => {
        if (confirm("Are you sure you want to permanently delete this listing?")) {
            setAds(ads.filter(ad => ad.id !== id));
            toast.success(`Listing ${id} has been deleted`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Used Bike Moderation</h1>
                    <p className="text-muted-foreground mt-1">Review and manage user-submitted advertisements.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                    <Button size="sm">Export Report</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by bike or seller..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={filterStatus === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterStatus("all")}
                            >All</Button>
                            <Button
                                variant={filterStatus === "pending" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterStatus("pending")}
                                className={cn(filterStatus === "pending" && "bg-yellow-600 hover:bg-yellow-700")}
                            >Pending</Button>
                            <Button
                                variant={filterStatus === "approved" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterStatus("approved")}
                                className={cn(filterStatus === "approved" && "bg-green-600 hover:bg-green-700")}
                            >Approved</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[100px]">ID</TableHead>
                                    <TableHead>Bike / Brand</TableHead>
                                    <TableHead>Seller</TableHead>
                                    <TableHead>Location / Year</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAds.length > 0 ? (
                                    filteredAds.map((ad) => (
                                        <TableRow key={ad.id} className="group transition-colors hover:bg-muted/30">
                                            <TableCell className="font-mono text-xs text-muted-foreground">{ad.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded bg-muted flex items-center justify-center">
                                                        <Bike className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{ad.bikeName}</p>
                                                        <p className="text-xs text-muted-foreground capitalize">{ad.brand}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{ad.seller}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <MapPin className="mr-1 h-3 w-3" /> {ad.location}
                                                    </div>
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <Calendar className="mr-1 h-3 w-3" /> {ad.year}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center font-bold">
                                                    <Tag className="mr-1.5 h-3.5 w-3.5 text-primary opacity-70" />
                                                    ৳{ad.price.toLocaleString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn(
                                                    ad.status === "pending" && "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
                                                    ad.status === "approved" && "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
                                                    ad.status === "rejected" && "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
                                                )}>
                                                    {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {ad.status === "pending" && (
                                                        <>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                onClick={() => handleApprove(ad.id)}
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleReject(ad.id)}
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                                                            <DropdownMenuItem><Users className="mr-2 h-4 w-4" /> Contact Seller</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteListing(ad.id)}>Delete Listing</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            No advertisements found matching your criteria.
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

