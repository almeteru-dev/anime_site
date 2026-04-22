"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"
import { cn } from "@/lib/utils"

interface ContentSectionProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export function ContentSection({ title, subtitle, children, className }: ContentSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className={cn("py-8 lg:py-12", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="text-foreground-muted mt-1">{subtitle}</p>
            )}
          </div>
          
          {/* Scroll Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-border hover:border-primary hover:bg-primary/10 transition-all duration-200 group"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-foreground-muted group-hover:text-primary transition-colors" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-border hover:border-primary hover:bg-primary/10 transition-all duration-200 group"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-foreground-muted group-hover:text-primary transition-colors" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 lg:gap-6 overflow-x-auto hide-scrollbar pb-4"
        >
          {children}
        </div>
      </div>
    </section>
  )
}
