"use client";

import { useNotifications } from "@/hooks/use-user";
import { 
  Bell, 
  Loader2, 
  CheckCircle2, 
  Mail,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Notification {
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  [key: string]: unknown;
}

export default function NotificationsPage() {
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications();

  const notifications = Array.isArray(notificationsData)
    ? notificationsData
    : (notificationsData as unknown as { results: Notification[] })?.results || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">Stay updated with your site activity.</p>
        </div>
        <Button variant="outline" size="sm" className="hidden sm:flex rounded-xl">
          Mark all as read
        </Button>
      </div>

      {notificationsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-start p-4 bg-card border rounded-xl">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed rounded-2xl bg-muted/5 space-y-4">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Bell className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-semibold">All caught up!</h3>
          <p className="text-muted-foreground">No new notifications to show.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification: Notification, i: number) => (
            <Card key={i} className={cn(
              "border-none shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group",
              notification.read ? "bg-card" : "bg-primary/[0.02] border-l-4 border-l-primary"
            )}>
              <CardContent className="p-4 flex gap-4 items-start">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                  notification.read ? "bg-muted" : "bg-primary/10"
                )}>
                  <CheckCircle2 className={cn("h-5 w-5", notification.read ? "text-muted-foreground" : "text-primary")} />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-bold truncate text-sm sm:text-base">
                      {notification.title || "System Message"}
                    </p>
                    <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                       {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {notification.message || "You have a new update."}
                  </p>
                </div>
                <TooltipProvider>
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Options</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end" className="rounded-xl">
                       <DropdownMenuItem className="cursor-pointer">Mark as read</DropdownMenuItem>
                       <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                         <Trash2 className="mr-2 h-4 w-4" /> Delete
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipProvider>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Fixed import of cn
import { cn } from "@/lib/utils";
