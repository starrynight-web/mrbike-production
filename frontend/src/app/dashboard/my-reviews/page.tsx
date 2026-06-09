"use client";

import { useMyReviews } from "@/hooks/use-user";
import { useUpdateReview, useDeleteReview } from "@/hooks/use-bikes";
import { 
  Star, 
  Loader2, 
  MessageSquare, 
  MoreVertical,
  Edit2,
  Trash2,
  Bike,
  ExternalLink,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Review } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function MyReviewsPage() {
  const { data: myReviews, isLoading: reviewsLoading } = useMyReviews();
  const { mutate: updateReview, isPending: updatePending } = useUpdateReview();
  const { mutate: deleteReview } = useDeleteReview();

  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  const handleEditClick = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdate = () => {
    if (!editingReview) return;
    updateReview(
      { 
        reviewId: String(editingReview.id), 
        rating: editRating, 
        comment: editComment 
      },
      {
        onSuccess: () => {
          toast.success("Review updated successfully");
          setEditingReview(null);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update review");
        }
      }
    );
  };

  const handleDeleteClick = (review: Review) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    deleteReview(
      { reviewId: String(review.id), bikeId: review.bikeId },
      {
        onSuccess: () => toast.success("Review deleted successfully"),
        onError: (err: any) => toast.error(err.message || "Failed to delete review")
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Reviews</h2>
          <p className="text-muted-foreground">Manage your bike reviews and ratings.</p>
        </div>
      </div>

      {reviewsLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col p-6 bg-card border rounded-2xl space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      ) : myReviews?.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed rounded-2xl bg-muted/5 space-y-5">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">No reviews found</h3>
            <p className="text-muted-foreground">
              You haven't reviewed any bikes yet.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/bikes">Explore Bikes to Review</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {myReviews?.map((review: Review) => (
            <div
              key={review.id}
              className="group flex flex-col p-6 bg-card border rounded-2xl hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                    <Bike className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                      {review.bike_name || "Unknown Bike"}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-3.5 w-3.5",
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/20"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {review.rating.toFixed(1)} / 5.0
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {review.isVerifiedOwner && (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-200 gap-1 hidden sm:flex">
                      <CheckCircle2 className="h-3 w-3" /> Verified Owner
                    </Badge>
                  )}
                  <TooltipProvider>
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>More Actions</p>
                        </TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuItem onClick={() => handleEditClick(review)} className="cursor-pointer">
                          <Edit2 className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" asChild>
                          <Link href={`/bike/${review.bike_slug}`}>
                            <ExternalLink className="mr-2 h-4 w-4" /> View Bike
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(review)}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipProvider>
                </div>
              </div>

              <div className="bg-muted/30 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">
                  &quot;{review.comment}&quot;
                </p>
              </div>

              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {(review.created_at || review.createdAt) ? 
                      new Date(review.created_at || review.createdAt!).toLocaleDateString() : 
                      "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Review Dialog */}
      <Dialog open={!!editingReview} onOpenChange={(open) => !open && setEditingReview(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Review</DialogTitle>
            <DialogDescription>
              Update your rating and feedback for {editingReview?.bike_name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        star <= editRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/20"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Your Opinion</label>
              <Textarea
                placeholder="Share your updated experience..."
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={5}
                className="rounded-2xl resize-none focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setEditingReview(null)}
              className="rounded-xl px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={updatePending || editRating === 0}
              className="rounded-xl px-8 bg-[#F97316] hover:bg-[#EA580C]"
            >
              {updatePending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
