"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSearch } from "./hero-search";

interface Slide {
  id: number | string;
  title: string;
  subtitle: string;
  image: string;
  cta_text?: string;
  cta_link?: string;
}

interface HomeHeroCarouselProps {
  slides: Slide[];
  fallbackTitle: string;
  fallbackSubtitle: string;
  fallbackImage: string;
}

export function HomeHeroCarousel({ 
  slides, 
  fallbackTitle, 
  fallbackSubtitle, 
  fallbackImage 
}: HomeHeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const displaySlides = slides.length > 0 ? slides : [{
    id: 'fallback',
    title: fallbackTitle,
    subtitle: fallbackSubtitle,
    image: fallbackImage,
    cta_text: "Browse Bikes",
    cta_link: "/bikes"
  }];

  useEffect(() => {
    if (!isAutoPlay || displaySlides.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % displaySlides.length);
    }, 6000);
    
    return () => clearInterval(timer);
  }, [isAutoPlay, displaySlides.length]);

  const next = () => {
    setIsAutoPlay(false);
    setCurrent((prev) => (prev + 1) % displaySlides.length);
  };

  const prev = () => {
    setIsAutoPlay(false);
    setCurrent((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
  };

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden bg-neutral-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={displaySlides[current].image || fallbackImage}
            alt={displaySlides[current].title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-neutral-950" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4 md:px-8">
        <motion.div
          key={`content-${current}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">
            {displaySlides[current].title.includes("Bangladesh") ? (
              <>
                {displaySlides[current].title.split("Bangladesh")[0]}
                <span className="text-primary italic">Bangladesh</span>
                {displaySlides[current].title.split("Bangladesh")[1]}
              </>
            ) : displaySlides[current].title}
          </h1>
          <p className="text-lg md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-md">
            {displaySlides[current].subtitle}
          </p>
          
          <div className="mb-12">
            <HeroSearch />
          </div>

          <div className="flex justify-center gap-4">
             {displaySlides[current].cta_link && (
                <Button size="lg" className="rounded-full px-8 h-12 text-lg font-bold" asChild>
                    <Link href={displaySlides[current].cta_link}>
                        {displaySlides[current].cta_text || "Learn More"}
                    </Link>
                </Button>
             )}
          </div>
        </motion.div>
      </div>

      {displaySlides.length > 1 && (
        <>
            <button 
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all"
            >
                <ChevronLeft className="h-8 w-8" />
            </button>
            <button 
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all"
            >
                <ChevronRight className="h-8 w-8" />
            </button>
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {displaySlides.map((_, i) => (
                    <button 
                        key={i}
                        onClick={() => { setIsAutoPlay(false); setCurrent(i); }}
                        className={`h-1.5 transition-all rounded-full ${i === current ? 'w-8 bg-primary' : 'w-2 bg-white/40'}`}
                    />
                ))}
            </div>
        </>
      )}
    </section>
  );
}
