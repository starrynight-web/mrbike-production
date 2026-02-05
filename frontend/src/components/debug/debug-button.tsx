"use client";

import Link from "next/link";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DebugButton() {
  // Only show in development environment
  // Note: We use process.env.NODE_ENV which is available at build time
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
            asChild
          >
            <Link href="/debug/routes" aria-label="Debug Routes">
              <Bug className="h-5 w-5" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Debug: View Application Routes</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
