import React from "react";
import { AdBanner } from "@/components/ads/ad-banner";
import { AdSkyscraper } from "@/components/ads/ad-skyscraper";
import { AdMediumRectangle } from "@/components/ads/ad-medium-rectangle";
import { AdInterstitial } from "@/components/ads/ad-interstitial";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";

export default function AdDemoPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="flex flex-col items-center text-center gap-4 mb-12">
        <Badge
          variant="outline"
          className="text-primary border-primary/20 bg-primary/5 px-4 py-1"
        >
          <Megaphone className="w-4 h-4 mr-2" />
          Ad Simulation
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">
          Advertisement Demo Page
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          A showcase of various advertisement formats that will be used across
          the MrBike platform. Use these dummy components to visualize placement
          and sizing.
        </p>
      </div>

      <div className="space-y-16">
        {/* Banner Section */}
        <section className="space-y-8">
          <div className="border-b pb-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Banner Formats</h2>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              Top of the page / Between sections
            </code>
          </div>

          <div className="space-y-12">
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">
                Standard Banner (Fixed 728x90)
              </p>
              <div className="flex justify-center overflow-x-auto py-2">
                <AdBanner forceVisible />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">
                Full-Width Banner (Edge-to-Edge)
              </p>
              <div className="bg-muted/10 p-4 rounded-xl border border-dashed overflow-hidden">
                  <p className="text-xs text-muted-foreground mb-4 text-center italic">
                    Below shows how it reaches the screen edges in a real layout.
                    For demo purposes here, it&apos;s simulated to break out of its
                    container:
                  </p>
                <div className="-mx-4 md:-mx-8 lg:-mx-12">
                  <AdBanner fullWidth forceVisible />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-[1fr_350px] gap-8">
          {/* Main Content Area Simulation */}
          <div className="space-y-8">
            <section className="space-y-6">
              <div className="border-b pb-2 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Medium Rectangle (300x250)
                </h2>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  Alongside content
                </code>
              </div>
              <div className="flex flex-wrap gap-8 justify-center">
                <AdMediumRectangle forceVisible />
                <div className="flex-1 min-w-[300px] border border-dashed rounded-lg p-6 bg-muted/20 flex items-center justify-center text-muted-foreground italic text-sm text-center">
                  This represents a content block where a medium rectangle ad
                  can float next to text or within a grid.
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="border-b pb-2 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Interstitial (320x480)
                </h2>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  Full-screen popup
                </code>
              </div>
              <div className="bg-muted/30 rounded-xl p-8 flex flex-col items-center justify-center border text-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Click the button below to see how the Interstitial ad looks
                  when triggered between page loads.
                </p>
                <AdInterstitial forceVisible />
              </div>
            </section>
          </div>

          {/* Sidebar Area Simulation */}
          <div className="space-y-6">
            <div className="border-b pb-2 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Skyscraper (160x600)</h2>
            </div>
            <div className="flex flex-col items-center gap-4 py-4">
              <code className="text-xs bg-muted px-2 py-1 rounded">
                Sidebar of the page
              </code>
              <div className="sticky top-24">
                <AdSkyscraper forceVisible />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
