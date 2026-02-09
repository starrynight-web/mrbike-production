"use client";

import { useEffect, useState } from "react";
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
    Users,
    Loader
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
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
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { adminAPI } from "@/lib/admin-api";

type UsedBikeListing = {
    id: number | string;
    bike_model_name?: string;
    title?: string;
    manufacturing_year?: number;
    year?: number;
    seller_location?: string;
    location?: string;
    image_url?: string;
    seller_name?: string;
    seller_phone?: string;
    brand?: string;
    price?: number | string;
    status?: string;
}

export default function UsedBikesModeration() {
    const [listings, setListings] = useState<UsedBikeListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: number | null; reason: string }>({
        open: false,
        id: null,
        reason: ""
    });

    useEffect(() => {
        loadListings();
    }, []);

    const loadListings = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllUsedBikes({
                limit: 100,
                offset: 0,
                sort: "newest"
            });
            setListings(response.results || response);
        } catch (error) {
            console.error("Failed to load listings:", error);
            toast.error("Failed to load listings");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            setApprovingId(id);
            await adminAPI.approveListing(id, "Approved by admin");
            toast.success("Listing approved successfully");
            setListings(listings.map(l => l.id === id ? { ...l, status: "approved" } : l));
        } catch (error) {
            console.error("Failed to approve listing:", error);
            toast.error("Failed to approve listing");
        } finally {
            setApprovingId(null);
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectDialog.id) return;

        try {
            setRejectingId(rejectDialog.id);
            await adminAPI.rejectListing(rejectDialog.id, rejectDialog.reason || "Rejected by admin");
            toast.error("Listing rejected");
            setListings(listings.map(l => l.id === rejectDialog.id ? { ...l, status: "rejected" } : l));
            setRejectDialog({ open: false, id: null, reason: "" });
        } catch (error) {
            console.error("Failed to reject listing:", error);
            toast.error("Failed to reject listing");
        } finally {
            setRejectingId(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to permanently delete this listing?")) return;

        try {
            setDeletingId(id);
            await adminAPI.deleteUsedBike(id);
            toast.success("Listing deleted successfully");
            setListings(listings.filter(l => l.id !== id));
        } catch (error) {
            console.error("Failed to delete listing:", error);
            toast.error("Failed to delete listing");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredListings = listings.filter(listing => {
        const bikeModel = listing.bike_model_name || listing.title || '';
        const sellerName = listing.seller_name || '';
        const brand = listing.brand || '';
        const matchesSearch = bikeModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            brand.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "all" || listing.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

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
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[80px]">Image</TableHead>
                                        <TableHead>Bike / Brand</TableHead>
                                        <TableHead>Seller</TableHead>
                                        <TableHead>Location / Year</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredListings.length > 0 ? (
                                        filteredListings.map((listing) => (
                                            <TableRow key={listing.id} className="group transition-colors hover:bg-muted/30">
                                                <TableCell>
                                                    <div className="h-10 w-10 flex-shrink-0 rounded bg-muted flex items-center justify-center overflow-hidden">
                                                        {listing.image_url ? (
                                                            <img src={listing.image_url} alt={listing.title} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Bike className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{listing.bike_model_name || listing.title}</p>
                                                        <p className="text-xs text-muted-foreground capitalize">{listing.brand}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{listing.seller_name}</div>
                                                    <p className="text-xs text-muted-foreground">{listing.seller_phone}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <MapPin className="mr-1 h-3 w-3" /> {listing.location}
                                                        </div>
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Calendar className="mr-1 h-3 w-3" /> {listing.year || listing.manufacturing_year}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center font-bold">
                                                        <Tag className="mr-1.5 h-3.5 w-3.5 text-primary opacity-70" />
                                                        ৳{Number(listing.price).toLocaleString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn(
                                                        listing.status === "pending" && "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
                                                        listing.status === "approved" && "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
                                                        listing.status === "rejected" && "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
                                                    )}>
                                                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {listing.status === "pending" && (
                                                            <>
                                                                <Button
                                                                    size="icon"
                                                                    variant="outline"
                                                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                    onClick={() => handleApprove(listing.id)}
                                                                    disabled={approvingId === listing.id}
                                                                >
                                                                    {approvingId === listing.id ? (
                                                                        <Loader className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <CheckCircle2 className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="outline"
                                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => setRejectDialog({ open: true, id: listing.id, reason: "" })}
                                                                    disabled={rejectingId === listing.id}
                                                                >
                                                                    {rejectingId === listing.id ? (
                                                                        <Loader className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <XCircle className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            </>
                                                        )}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8" disabled={deletingId === listing.id}>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem disabled>
                                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem disabled>
                                                                    <Users className="mr-2 h-4 w-4" /> Contact Seller
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => handleDelete(listing.id)}
                                                                    disabled={deletingId === listing.id}
                                                                >
                                                                    {deletingId === listing.id ? (
                                                                        <>
                                                                            <Loader className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                                                                        </>
                                                                    ) : (
                                                                        "Delete Listing"
                                                                    )}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                                {listings.length === 0 ? "No listings yet." : "No listings found matching your criteria."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Reject Dialog */}
            <Dialog open={rejectDialog.open} onOpenChange={(open) => {
                if (!open) setRejectDialog({ open: false, id: null, reason: "" });
                else setRejectDialog({ ...rejectDialog, open: true });
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Listing</DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejecting this listing. The seller will be notified.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason (optional)</Label>
                            <Textarea
                                id="reason"
                                placeholder="e.g., Low quality images, Missing specifications, Suspicious pricing..."
                                rows={4}
                                value={rejectDialog.reason}
                                onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setRejectDialog({ open: false, id: null, reason: "" })}
                                disabled={rejectingId === rejectDialog.id}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleRejectSubmit}
                                disabled={rejectingId === rejectDialog.id}
                            >
                                {rejectingId === rejectDialog.id ? (
                                    <>
                                        <Loader className="mr-2 h-4 w-4 animate-spin" /> Rejecting...
                                    </>
                                ) : (
                                    "Reject"
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
