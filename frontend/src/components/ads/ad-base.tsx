import React from "react";
import { cn } from "@/lib/utils";

interface AdBaseProps {
  width: number | string;
  height: number;
  label: string;
  className?: string;
  fullWidth?: boolean;
  children?: React.ReactNode;
  forceVisible?: boolean;
}

export const shouldShowAds = (forceVisible?: boolean) =>
  forceVisible || process.env.NEXT_PUBLIC_SHOW_ADS === "true";

export function AdBase({
  width,
  height,
  label,
  className,
  fullWidth,
  children,
  forceVisible,
}: AdBaseProps) {
  if (!shouldShowAds(forceVisible)) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center bg-muted border-2 border-dashed border-muted-foreground/30 overflow-hidden group hover:border-primary/50 transition-colors",
        fullWidth ? "w-full rounded-none border-x-0" : "rounded-lg",
        className,
      )}
      style={{
        width: fullWidth
          ? "100%"
          : typeof width === "number"
            ? `${width}px`
            : width,
        height: `${height}px`,
        maxWidth: fullWidth ? "none" : "100%",
      }}
    >
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />

      <div className="z-10 text-center p-4">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 mb-1 block">
          Advertisement
        </span>
        <h3 className="text-sm font-semibold text-foreground/80">{label}</h3>
        <p className="text-[10px] text-muted-foreground mt-1">
          {width} x {height} px
        </p>
      </div>

      {children && <div className="z-20 mt-4">{children}</div>}

      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="text-[8px] bg-background/80 px-1 rounded text-muted-foreground">
          Dummy Ad
        </div>
      </div>
    </div>
  );
}
