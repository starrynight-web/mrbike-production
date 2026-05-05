"use client";

import { useState } from "react";
import { AdBase, shouldShowAds } from "./ad-base";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AdInterstitialProps {
  forceVisible?: boolean;
}

export function AdInterstitial({ forceVisible }: AdInterstitialProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!shouldShowAds(forceVisible)) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full max-w-[300px]"
      >
        Trigger Interstitial Ad Demo
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative animate-in zoom-in-95 duration-200">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/20 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close ad</span>
            </Button>

            <AdBase
              width={320}
              height={480}
              label="Interstitial Ad"
              className="bg-background shadow-2xl border-solid border-primary/20"
              forceVisible={forceVisible}
            >
              <div className="mt-8 flex flex-col gap-2">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="default"
                  className="w-full"
                >
                  Proceed to Content
                </Button>
              </div>
            </AdBase>
          </div>
        </div>
      )}
    </>
  );
}
