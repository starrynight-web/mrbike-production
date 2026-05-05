"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { HeroSearch } from "./hero-search";

interface HomeHeroCarouselProps {
  title: string;
  subtitle: string;
}

const heroImages = [
  "/images/hero.webp",
  "/images/hero-red.webp",
  "/images/hero-orange.webp",
];

// Animation timing constants (ms)
const SLIDE_UP_DURATION = 600;
const SLIDE_UP_DELAY = 100;
const WIPE_DELAY = SLIDE_UP_DELAY + SLIDE_UP_DURATION + 100; // starts after slide-up settles
const WIPE_DURATION = 1000;
const SUBTITLE_WIPE_OFFSET = 160; // subtitle wipe starts slightly after title
const REVEAL_DONE_AFTER = WIPE_DELAY + WIPE_DURATION + SUBTITLE_WIPE_OFFSET + 200;

export function HomeHeroCarousel({ title, subtitle }: HomeHeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hasPlayedReveal, setHasPlayedReveal] = useState(false);
  const scrollSnaps = emblaApi?.scrollSnapList() ?? heroImages.map((_, i) => i);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    const timer = window.setInterval(() => emblaApi.scrollNext(), 6000);
    return () => window.clearInterval(timer);
  }, [emblaApi]);

  // Mark reveal as done so wipe overlays are removed from DOM
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHasPlayedReveal(true);
    }, REVEAL_DONE_AFTER);
    return () => window.clearTimeout(timer);
  }, []);

  const highlightTitle = title.includes("Bangladesh")
    ? title.split("Bangladesh")
    : null;

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden bg-neutral-950">
      {/* Background carousel */}
      <div className="absolute inset-0" ref={emblaRef}>
        <div className="flex h-full">
          {heroImages.map((src, index) => (
            <div key={src} className="relative h-full flex-[0_0_100%]">
              <Image
                src={src}
                alt={`Hero slide ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-neutral-950" />
            </div>
          ))}
        </div>
      </div>

      {/*
        Content container — slides up from below on mount.
        The text-reveal wipe animations run after this settles.
      */}
      <div
        className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4 md:px-8"
        style={{
          animation: `heroSlideUp ${SLIDE_UP_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1) ${SLIDE_UP_DELAY}ms both`,
        }}
      >
        <div className="max-w-4xl">

          {/* ── Title with rectangle-wipe reveal ── */}
          <div className="relative inline-block overflow-hidden mb-6">
            <h1
              className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg"
              style={{
                animation: !hasPlayedReveal
                  ? `heroTextReveal ${WIPE_DURATION}ms ease-out ${WIPE_DELAY}ms both`
                  : undefined,
                opacity: hasPlayedReveal ? 1 : undefined,
              }}
            >
              {highlightTitle ? (
                <>
                  {highlightTitle[0]}
                  <span className="text-primary">Bangladesh</span>
                  {highlightTitle[1]}
                </>
              ) : (
                <>
                  <span className="text-white">{title.split(" ").slice(0, -1).join(" ")}</span>{" "}
                  <span className="text-primary">{title.split(" ").slice(-1)}</span>
                </>
              )}
            </h1>

            {/* Rectangle wipe overlay — expands from center then collapses */}
            {!hasPlayedReveal && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-primary/90 will-change-[clip-path]"
                style={{
                  animation: `heroWipe ${WIPE_DURATION}ms cubic-bezier(0.65, 0, 0.35, 1) ${WIPE_DELAY}ms both`,
                }}
              />
            )}
          </div>

          {/* ── Subtitle with staggered rectangle-wipe reveal ── */}
          <div className="relative overflow-hidden max-w-2xl mx-auto mb-10">
            <p
              className="text-lg md:text-2xl text-white/90 drop-shadow-md"
              style={{
                animation: !hasPlayedReveal
                  ? `heroTextReveal ${WIPE_DURATION}ms ease-out ${WIPE_DELAY + SUBTITLE_WIPE_OFFSET}ms both`
                  : undefined,
                opacity: hasPlayedReveal ? 1 : undefined,
              }}
            >
              {subtitle}
            </p>

            {!hasPlayedReveal && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-white/90 will-change-[clip-path]"
                style={{
                  animation: `heroWipe ${WIPE_DURATION}ms cubic-bezier(0.65, 0, 0.35, 1) ${WIPE_DELAY + SUBTITLE_WIPE_OFFSET}ms both`,
                }}
              />
            )}
          </div>

          {/* ── Search & CTA ── */}
          <div className="mb-12">
            <HeroSearch />
          </div>

          <div className="flex justify-center gap-4">
            <Button size="lg" className="rounded-full px-8 h-12 text-lg font-bold" asChild>
              <Link href="/bikes">Browse Bikes</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="sr-only">
        {scrollSnaps.length} slides. Currently on slide {selectedIndex + 1}.
      </div>
    </section>
  );
}
