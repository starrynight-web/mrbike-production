"use client";

import Link from "next/link";
import { Bug, Lock, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DebugButton() {
  // Only show in development environment
  // Note: We use process.env.NODE_ENV which is available at build time
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Bug className="h-5 w-5" />
          <span className="sr-only">Debug Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Debug Tools</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/debug/routes" className="cursor-pointer">
            <Map className="mr-2 h-4 w-4" />
            View Routes
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/login" className="cursor-pointer">
            <Lock className="mr-2 h-4 w-4" />
            Login Page
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
