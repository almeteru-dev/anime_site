"use client"

import { Star, Play, Calendar, Film, Clock, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HeroHeaderProps {
  anime: {
    title: string
    japaneseTitle: string
    rating: number
    year: number
    status: "Ongoing" | "Finished" | "Upcoming"
    studio: string
    episodes: number
    duration: string
    genres: string[]
    coverImage: string
  }
  onStartWatching: () => void
}

export function HeroHeader({ anime, onStartWatching }: HeroHeaderProps) {
  return (
    <section className="relative w-full min-h-[70vh] overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${anime.coverImage})` }}
      >
        {/* Multi-layer gradient for cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#040D1F] via-[#040D1F]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040D1F] via-[#040D1F]/50 to-transparent" />
        <div className="absolute inset-0 bg-[#040D1F]/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col justify-end min-h-[70vh]">
        <div className="max-w-3xl space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance">
              {anime.title}
            </h1>
            <p className="text-[#A3CFFF] text-lg font-medium">{anime.japaneseTitle}</p>
          </div>

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-4 text-[#D1D9E6]">
            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-[#00E5FF] text-[#00E5FF]" />
              <span className="font-semibold text-white">{anime.rating.toFixed(1)}</span>
            </div>

            {/* Year */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#A3CFFF]" />
              <span>{anime.year}</span>
            </div>

            {/* Episodes */}
            <div className="flex items-center gap-1.5">
              <Film className="w-4 h-4 text-[#A3CFFF]" />
              <span>{anime.episodes} Episodes</span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#A3CFFF]" />
              <span>{anime.duration}</span>
            </div>

            {/* Studio */}
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#A3CFFF]" />
              <span>{anime.studio}</span>
            </div>

            {/* Status Badge */}
            <Badge 
              variant="outline" 
              className={`
                border-[#00E5FF]/50 text-[#00E5FF] font-medium px-3 py-1
                ${anime.status === "Ongoing" ? "bg-[#00E5FF]/10" : ""}
                ${anime.status === "Finished" ? "bg-[#A3CFFF]/10 border-[#A3CFFF]/50 text-[#A3CFFF]" : ""}
              `}
            >
              {anime.status}
            </Badge>
          </div>

          {/* Genre Tags */}
          <div className="flex flex-wrap gap-2">
            {anime.genres.map((genre) => (
              <Badge 
                key={genre}
                variant="secondary"
                className="bg-[#0D1A3A] text-[#D1D9E6] border border-[#1A2847] hover:bg-[#1A2847] hover:border-[#A3CFFF]/30 transition-all duration-300 px-3 py-1"
              >
                {genre}
              </Badge>
            ))}
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              size="lg"
              onClick={onStartWatching}
              className="bg-[#00E5FF] hover:bg-[#33CCFF] text-[#040D1F] font-bold text-lg px-8 py-6 rounded-xl shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:shadow-[0_0_40px_rgba(0,229,255,0.5)] transition-all duration-300 group"
            >
              <Play className="w-5 h-5 mr-2 fill-current group-hover:scale-110 transition-transform" />
              Start Watching
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom fade for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#040D1F] to-transparent pointer-events-none" />
    </section>
  )
}
