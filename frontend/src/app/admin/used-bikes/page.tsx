"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
  Loader,
  AlertTriangle,
  Scale,
  Fuel,
  Info,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { adminAPI, UsedBikeListing } from "@/lib/admin-api";
import { sanitizeImageUrl } from "@/lib/data-utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const BIKE_CATEGORIES = [
  { value: "sports", label: "Sports" },
  { value: "naked", label: "Naked Sport" },
  { value: "cruiser", label: "Cruiser" },
  { value: "commuter", label: "Commuter" },
  { value: "scooter", label: "Scooter" },
  { value: "adventure", label: "Adventure" },
  { value: "cafe_racer", label: "Cafe Racer" },
  { value: "offroad", label: "Off-Road" },
];

export default function UsedBikesModeration() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "active" | "rejected" | "sold"
  >("pending");
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    id: number | null;
    reason: string;
  }>({
    open: false,
    id: null,
    reason: "",
  });
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    listing: UsedBikeListing | null;
  }>({
    open: false,
    listing: null,
  });
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean;
    id: number | null;
    category: string;
  }>({
    open: false,
    id: null,
    category: "commuter",
  });

  const queryClient = useQueryClient();

  const { data: listings = [], isLoading: listingsLoading } = useQuery<UsedBikeListing[]>({
    queryKey: ["admin", "used-bikes", filterStatus],
    queryFn: async () => {
      const response = await adminAPI.getAllUsedBikes({
        limit: 100,
        offset: 0,
        sort: "newest",
        status: (filterStatus === "all" ? undefined : filterStatus) as any,
      });
      return response.results || response || [];
    },
    staleTime: 1 * 60 * 1000,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, category }: { id: number; category: string }) => adminAPI.approveListing(id, category),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "used-bikes", filterStatus] });
      const previousListings = queryClient.getQueryData<UsedBikeListing[]>(["admin", "used-bikes", filterStatus]);
      queryClient.setQueryData<UsedBikeListing[]>(["admin", "used-bikes", filterStatus], old => 
        (old || []).map(l => l.id === id ? { ...l, status: "active" } : l)
      );
      setApprovingId(id);
      return { previousListings };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["admin", "used-bikes", filterStatus], context?.previousListings);
      toast.error("Failed to approve listing");
    },
    onSuccess: () => {
      toast.success("Listing approved successfully");
      setApproveDialog({ open: false, id: null, category: "commuter" });
    },
    onSettled: () => {
      setApprovingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "used-bikes"] });
    }
  });

  const handleApproveSubmit = () => {
    if (!approveDialog.id) return;
    approveMutation.mutate({ id: approveDialog.id, category: approveDialog.category });
  };

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => adminAPI.rejectListing(id, reason || "Rejected by admin"),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "used-bikes", filterStatus] });
      const previousListings = queryClient.getQueryData<UsedBikeListing[]>(["admin", "used-bikes", filterStatus]);
      queryClient.setQueryData<UsedBikeListing[]>(["admin", "used-bikes", filterStatus], old => 
        (old || []).map(l => l.id === id ? { ...l, status: "rejected" } : l)
      );
      setRejectingId(id);
      return { previousListings };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["admin", "used-bikes", filterStatus], context?.previousListings);
      toast.error("Failed to reject listing");
    },
    onSuccess: () => {
      toast.success("Listing rejected");
      setRejectDialog({ open: false, id: null, reason: "" });
    },
    onSettled: () => {
      setRejectingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "used-bikes"] });
    }
  });

  const handleRejectSubmit = () => {
    if (!rejectDialog.id) return;
    rejectMutation.mutate({ id: rejectDialog.id, reason: rejectDialog.reason });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminAPI.deleteUsedBike(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "used-bikes", filterStatus] });
      const previousListings = queryClient.getQueryData<UsedBikeListing[]>(["admin", "used-bikes", filterStatus]);
      queryClient.setQueryData<UsedBikeListing[]>(["admin", "used-bikes", filterStatus], old => 
        (old || []).filter(l => l.id !== id)
      );
      setDeletingId(id);
      return { previousListings };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["admin", "used-bikes", filterStatus], context?.previousListings);
      toast.error("Failed to delete listing");
    },
    onSuccess: () => {
      toast.success("Listing deleted successfully");
    },
    onSettled: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "used-bikes"] });
    }
  });

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this listing?")) return;
    deleteMutation.mutate(id);
  };

  const [showReportedOnly, setShowReportedOnly] = useState(false);

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.bike_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.seller_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || listing.status === filterStatus;
    const matchesReported = showReportedOnly ? (listing.reports_count || 0) > 0 : true;
    return matchesSearch && matchesStatus && matchesReported;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Used Bike Moderation
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage user-submitted advertisements.
          </p>
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
                onClick={() => {
                  setFilterStatus("all");
                  setShowReportedOnly(false);
                }}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "pending" && !showReportedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterStatus("pending");
                  setShowReportedOnly(false);
                }}
                className={cn(
                  filterStatus === "pending" && !showReportedOnly &&
                  "bg-yellow-600 hover:bg-yellow-700",
                )}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === "active" && !showReportedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterStatus("active");
                  setShowReportedOnly(false);
                }}
                className={cn(
                  filterStatus === "active" && !showReportedOnly &&
                  "bg-green-600 hover:bg-green-700",
                )}
              >
                Active
              </Button>
              <Button
                variant={showReportedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => {
                   setShowReportedOnly(!showReportedOnly);
                }}
                className={cn(
                  "border-red-200 text-red-600 hover:bg-red-50",
                  showReportedOnly && "bg-red-600 text-white hover:bg-red-700 hover:text-white border-red-600"
                )}
              >
                <AlertTriangle className="mr-2 h-4 w-4" /> Reported
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {listingsLoading ? (
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
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Bike / Brand</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Location / Year</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredListings.length > 0 ? (
                    filteredListings.map((listing) => (
                      <TableRow
                        key={listing.id}
                        className="group transition-colors hover:bg-muted/30"
                      >
                        <TableCell>
                          <div className="h-12 w-16 rounded overflow-hidden bg-muted relative">
                            {(() => {
                              const imageUrl = sanitizeImageUrl(
                                (listing as any).image_url || 
                                (listing as any).thumbnail_url || 
                                (listing as any).images?.[0]?.url || 
                                (listing as any).images?.[0], 
                                undefined
                              );
                              return imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={listing.bike_model}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Bike className="h-6 w-6 text-muted-foreground" />
                                </div>
                              );
                            })()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{listing.bike_model}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {listing.brand}
                            </p>
                            {listing.reports_count && listing.reports_count > 0 ? (
                              <div className="flex items-center mt-1 text-xs text-red-500 font-medium">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                {listing.reports_count} {listing.reports_count === 1 ? 'Report' : 'Reports'}
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {listing.seller_name}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {listing.seller_phone}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="mr-1 h-3 w-3" />{" "}
                                {typeof listing.seller_location === 'object' ? (listing.seller_location as any).full : listing.seller_location}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="mr-1 h-3 w-3" />{" "}
                              {listing.year}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {listing.category || 'Commuter'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center font-bold">
                            <Tag className="mr-1.5 h-3.5 w-3.5 text-primary opacity-70" />
                            ৳{listing.price.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              listing.status === "pending" &&
                              "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
                              listing.status === "active" &&
                              "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
                              listing.status === "rejected" &&
                              "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
                            )}
                          >
                            {listing.status.charAt(0).toUpperCase() +
                              listing.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <div className="flex items-center justify-end gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/5"
                                    onClick={() =>
                                      setPreviewDialog({
                                        open: true,
                                        listing: listing,
                                      })
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Preview Ad</p>
                                </TooltipContent>
                              </Tooltip>

                              {listing.status === "pending" && (
                                <>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={() =>
                                          setApproveDialog({
                                            open: true,
                                            id: listing.id,
                                            category: listing.category || "commuter",
                                          })
                                        }
                                        disabled={approvingId === listing.id}
                                      >
                                        {approvingId === listing.id ? (
                                          <Loader className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <CheckCircle2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Approve</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() =>
                                          setRejectDialog({
                                            open: true,
                                            id: listing.id,
                                            reason: "",
                                          })
                                        }
                                        disabled={rejectingId === listing.id}
                                      >
                                        {rejectingId === listing.id ? (
                                          <Loader className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <XCircle className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Reject</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </>
                              )}
                              
                              <DropdownMenu>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        disabled={deletingId === listing.id}
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>More Actions</p>
                                  </TooltipContent>
                                </Tooltip>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setPreviewDialog({ open: true, listing: listing })}>
                                  <Eye className="mr-2 h-4 w-4" /> Preview Full Ad
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled>
                                  <Users className="mr-2 h-4 w-4" /> Contact
                                  Seller
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(listing.id)}
                                  disabled={deletingId === listing.id}
                                >
                                  {deletingId === listing.id ? (
                                    <>
                                      <Loader className="mr-2 h-4 w-4 animate-spin" />{" "}
                                      Deleting...
                                    </>
                                  ) : (
                                    "Delete Listing"
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            </div>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-32 text-center text-muted-foreground"
                      >
                        {listings.length === 0
                          ? "No listings yet."
                          : "No listings found matching your criteria."}
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
      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => {
          if (!open) setRejectDialog({ open: false, id: null, reason: "" });
          else setRejectDialog({ ...rejectDialog, open: true });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Listing</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this listing. The seller will be
              notified.
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
                onChange={(e) =>
                  setRejectDialog({ ...rejectDialog, reason: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() =>
                  setRejectDialog({ open: false, id: null, reason: "" })
                }
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
                    <Loader className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Rejecting...
                  </>
                ) : (
                  "Reject"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Approve Dialog */}
      <Dialog
        open={approveDialog.open}
        onOpenChange={(open) => {
          if (!open)
            setApproveDialog({ open: false, id: null, category: "commuter" });
          else setApproveDialog({ ...approveDialog, open: true });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Listing</DialogTitle>
            <DialogDescription>
              Select a category for this bike before approving.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={approveDialog.category}
                onValueChange={(val) =>
                  setApproveDialog({ ...approveDialog, category: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
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
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() =>
                  setApproveDialog({
                    open: false,
                    id: null,
                    category: "commuter",
                  })
                }
                disabled={approvingId === approveDialog.id}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleApproveSubmit}
                disabled={approvingId === approveDialog.id}
              >
                {approvingId === approveDialog.id ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Approving...
                  </>
                ) : (
                  "Approve & Publish"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Preview Full Detail Dialog */}
      <Dialog
        open={previewDialog.open}
        onOpenChange={(open) => {
          if (!open) setPreviewDialog({ open: false, listing: null });
          else setPreviewDialog({ ...previewDialog, open: true });
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Listing Details</DialogTitle>
            <DialogDescription>
              Review all information provided by the seller.
            </DialogDescription>
          </DialogHeader>

          {previewDialog.listing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-6">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border">
                  { ((previewDialog.listing.images?.length ?? 0) > 0 || previewDialog.listing.image_url) ? (
                    <Image
                      src={sanitizeImageUrl(previewDialog.listing.images?.[0]?.url || previewDialog.listing.images?.[0] || previewDialog.listing.image_url)}
                      alt={previewDialog.listing.title || previewDialog.listing.bike_model}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Bike className="h-12 w-12 text-muted-foreground opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={previewDialog.listing.status === 'active' ? 'default' : 'secondary'}>
                      {previewDialog.listing.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Specifications
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Year</p>
                      <p className="font-medium">{previewDialog.listing.year}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Engine CC</p>
                      <p className="font-medium">{previewDialog.listing.engine_cc || 'N/A'} CC</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Mileage</p>
                      <p className="font-medium">{previewDialog.listing.mileage.toLocaleString()} km</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Condition</p>
                      <p className="font-medium capitalize">{previewDialog.listing.condition.replace('_', ' ')}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium truncate">{typeof previewDialog.listing.seller_location === 'object' ? (previewDialog.listing.seller_location as any).city : previewDialog.listing.seller_location}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Ownership</p>
                      <p className="font-medium">{previewDialog.listing.ownership_count || 1} Owner(s)</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                    <Info className="h-4 w-4" />
                    Registration & Condition
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Reg. Year</p>
                      <p className="font-medium">{previewDialog.listing.registration_year || 'Not Registered'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Reg. Type</p>
                      <p className="font-medium">{previewDialog.listing.registration_type || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Engine Cond.</p>
                      <p className="font-medium">{previewDialog.listing.engine_condition || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Body Cond.</p>
                      <p className="font-medium">{previewDialog.listing.body_condition || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Papers</p>
                      <p className="font-medium text-primary">{previewDialog.listing.has_original_papers ? 'Original' : 'Missing'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Accident Hist.</p>
                      <p className={cn("font-medium", previewDialog.listing.has_accident_history ? "text-red-500" : "text-green-600")}>
                        {previewDialog.listing.has_accident_history ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>

                {previewDialog.listing.reports_count ? previewDialog.listing.reports_count > 0 && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-100 dark:bg-red-900/10 dark:border-red-900/20">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold mb-1">
                      <AlertTriangle className="h-4 w-4" />
                      Community Reports ({previewDialog.listing.reports_count})
                    </div>
                    <p className="text-xs text-red-500/80">
                      This listing has been flagged by users. Please review carefully before approving.
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">{previewDialog.listing.bike_model}</h2>
                  <p className="text-primary font-bold text-xl mt-1">
                    ৳{previewDialog.listing.price.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                    <Users className="h-4 w-4" />
                    Seller Information
                  </h3>
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Name</span>
                      <span className="font-medium">{previewDialog.listing.seller_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Phone</span>
                      <span className="font-medium">{previewDialog.listing.seller_phone}</span>
                    </div>
                    {previewDialog.listing.whatsapp_number && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">WhatsApp</span>
                        <span className="font-medium text-green-600">{previewDialog.listing.whatsapp_number}</span>
                      </div>
                    )}
                    {previewDialog.listing.primary_contact_number && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Primary Contact</span>
                        <span className="font-medium">{previewDialog.listing.primary_contact_number}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-1 border-t">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <Badge variant="outline" className="capitalize">
                        {previewDialog.listing.category || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                    <Info className="h-4 w-4" />
                    Description & Modifications
                  </h3>
                  <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground mb-1">Seller Remark:</p>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {previewDialog.listing.description}
                      </p>
                    </div>
                    {previewDialog.listing.modifications && (
                      <div className="pt-2 border-t">
                        <p className="text-xs font-bold text-muted-foreground mb-1">Modifications:</p>
                        <p className="text-sm text-primary">
                          {previewDialog.listing.modifications}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  {previewDialog.listing.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setPreviewDialog({ open: false, listing: null });
                          setApproveDialog({ open: true, id: previewDialog.listing?.id || null, category: previewDialog.listing?.category || 'commuter' });
                        }}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          setPreviewDialog({ open: false, listing: null });
                          setRejectDialog({ open: true, id: previewDialog.listing?.id || null, reason: '' });
                        }}
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    </div>
                  )}
                  {previewDialog.listing.status !== 'pending' && (
                     <Button 
                        variant="destructive"
                        className="w-full"
                        onClick={() => {
                          setPreviewDialog({ open: false, listing: null });
                          handleDelete(previewDialog.listing!.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                      </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Re-using Trash2 and other icons if needed, but they are imported above.
// Wait, I missed Trash2 in imports? 
// Checking imports at top... yes, Trash2 is NOT there.
// I will add it.

