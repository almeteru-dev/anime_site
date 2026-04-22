"use client"

import { useState, useCallback, useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { Play, Info, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const featuredAnime = [
  {
    id: 1,
    title: "Shadow Sovereign",
    synopsis: "When humanity faces extinction, one warrior rises from the shadows. With the power to command an army of darkness, he must choose between saving the world or becoming its greatest threat.",
    rating: 9.2,
    genres: ["Action", "Fantasy", "Dark Fantasy"],
    image: "/images/anime-1.jpg",
    episodes: 24,
  },
  {
    id: 2,
    title: "Frost Enchantress",
    synopsis: "In a world where magic flows through bloodlines, a young ice mage discovers her true heritage. Her journey to master forbidden spells will reshape the frozen kingdoms forever.",
    rating: 8.9,
    genres: ["Fantasy", "Adventure", "Magic"],
    image: "/images/anime-2.jpg",
    episodes: 12,
  },
  {
    id: 3,
    title: "Crimson Blade",
    synopsis: "A lone samurai seeks vengeance against the demon clan that destroyed his village. Armed with a cursed blade, he walks the path between humanity and monster.",
    rating: 9.5,
    genres: ["Action", "Historical", "Supernatural"],
    image: "/images/anime-6.jpg",
    episodes: 26,
  },
]

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {featuredAnime.map((anime, index) => (
            <div
              key={anime.id}
              className="flex-none w-full h-full relative"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={anime.image}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                {/* Radial gradient for depth */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_transparent_40%,_var(--background)_100%)]" />
              </div>

              {/* Content */}
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="max-w-2xl pt-20">
                  {/* Genres */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {anime.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/30 rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight text-balance">
                    {anime.title}
                  </h1>

                  {/* Rating & Episodes */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-5 h-5 text-primary fill-primary" />
                      <span className="text-lg font-semibold text-primary">
                        {anime.rating}
                      </span>
                    </div>
                    <span className="text-foreground-muted">•</span>
                    <span className="text-foreground-muted">
                      {anime.episodes} Episodes
                    </span>
                  </div>

                  {/* Synopsis */}
                  <p className="text-foreground-muted text-lg leading-relaxed mb-8 max-w-xl">
                    {anime.synopsis}
                  </p>

                  {/* Buttons */}
                  <div className="flex flex-wrap gap-4">
                    <button className="group flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-[var(--glow-primary)] transition-all duration-300">
                      <Play className="w-5 h-5 fill-current" />
                      Watch Now
                    </button>
                    <button className="flex items-center gap-2 px-8 py-3 bg-transparent border border-secondary/50 text-foreground font-semibold rounded-lg hover:bg-secondary/10 hover:border-secondary transition-all duration-300">
                      <Info className="w-5 h-5" />
                      More Info
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-background/50 backdrop-blur-sm border border-border hover:bg-primary/20 hover:border-primary transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-background/50 backdrop-blur-sm border border-border hover:bg-primary/20 hover:border-primary transition-all duration-300 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {featuredAnime.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              selectedIndex === index
                ? "w-8 bg-primary"
                : "w-2 bg-foreground-muted/50 hover:bg-foreground-muted"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
