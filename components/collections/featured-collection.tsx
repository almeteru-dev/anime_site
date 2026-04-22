"use client"

import Image from "next/image"
import { Play, Layers, Trophy, ArrowRight } from "lucide-react"

interface AnimePreview {
  id: number
  title: string
  image: string
}

interface FeaturedCollectionProps {
  title: string
  description: string
  coverImage: string
  titleCount: number
  previews: AnimePreview[]
  curator?: string
}

export function FeaturedCollection({
  title,
  description,
  coverImage,
  titleCount,
  previews,
  curator = "AnimeVista Editors",
}: FeaturedCollectionProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1832] to-[#081229]">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00E5FF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#33CCFF]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative grid lg:grid-cols-2 gap-8 p-6 lg:p-10">
        {/* Content Side */}
        <div className="flex flex-col justify-center order-2 lg:order-1">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 w-fit mb-6">
            <Trophy className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-sm font-semibold text-[#00E5FF]">Collection of the Month</span>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight text-balance">
            {title}
          </h2>
          
          {/* Description */}
          <p className="text-lg text-[#D1D9E6] mb-6 leading-relaxed max-w-xl">
            {description}
          </p>
          
          {/* Curator & Stats */}
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#33CCFF] flex items-center justify-center">
                <span className="text-xs font-bold text-[#040D1F]">AV</span>
              </div>
              <span className="text-sm text-[#A3CFFF]">Curated by {curator}</span>
            </div>
            <div className="flex items-center gap-2 text-[#8B9DC3]">
              <Layers className="w-4 h-4" />
              <span className="text-sm font-medium">{titleCount} Titles</span>
            </div>
          </div>
          
          {/* Preview Titles */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-wider text-[#8B9DC3] mb-3">Featured in this collection</p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {previews.slice(0, 5).map((anime, index) => (
                  <div
                    key={anime.id}
                    className="relative w-14 h-20 rounded-lg overflow-hidden border-2 border-[#081229] 
                      transition-all duration-300 hover:scale-110 hover:z-10 hover:border-[#00E5FF]/50
                      shadow-lg"
                    style={{ zIndex: previews.length - index }}
                  >
                    <Image
                      src={anime.image}
                      alt={anime.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <span className="text-sm text-[#A3CFFF] font-medium">
                +{titleCount - 5} more titles
              </span>
            </div>
          </div>
          
          {/* CTA Button */}
          <button className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl 
            bg-[#00E5FF] text-[#040D1F] font-bold text-lg
            transition-all duration-300 ease-out w-fit
            hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:scale-105">
            <Play className="w-5 h-5" fill="#040D1F" />
            <span>Explore Collection</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
        
        {/* Image Side */}
        <div className="relative order-1 lg:order-2">
          <div className="relative aspect-[4/3] lg:aspect-[3/4] rounded-xl overflow-hidden group cursor-pointer">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#040D1F]/60 via-transparent to-transparent" />
            
            {/* Animated border */}
            <div className="absolute inset-0 rounded-xl border-2 border-[#00E5FF]/0 
              group-hover:border-[#00E5FF]/40 transition-colors duration-500" />
          </div>
          
          {/* Floating accent */}
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#00E5FF]/20 rounded-full blur-2xl" />
        </div>
      </div>
      
      {/* Bottom border glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px 
        bg-gradient-to-r from-transparent via-[#00E5FF]/50 to-transparent" />
    </section>
  )
}
