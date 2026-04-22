"use client"

import Image from "next/image"
import { Play, Layers } from "lucide-react"

interface AnimePreview {
  id: number
  title: string
  image: string
}

interface CollectionCardProps {
  title: string
  description: string
  coverImage: string
  titleCount: number
  previews: AnimePreview[]
  featured?: boolean
}

export function CollectionCard({
  title,
  description,
  coverImage,
  titleCount,
  previews,
  featured = false,
}: CollectionCardProps) {
  return (
    <article
      className={`group relative overflow-hidden rounded-xl bg-[#0A1832] transition-all duration-500 ease-out
        ${featured ? "col-span-full lg:col-span-2 row-span-2" : ""}
        hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,229,255,0.25)]
        cursor-pointer`}
      style={{
        boxShadow: "inset 0 1px 0 rgba(163, 207, 255, 0.1), 0 4px 24px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Cover Image */}
      <div className={`relative overflow-hidden ${featured ? "h-72 lg:h-96" : "h-48"}`}>
        <Image
          src={coverImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1832] via-[#0A1832]/60 to-transparent" />
        
        {/* Play button overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-[#00E5FF]/90 flex items-center justify-center backdrop-blur-sm
            shadow-[0_0_30px_rgba(0,229,255,0.6)] transition-transform duration-300 group-hover:scale-110">
            <Play className="w-7 h-7 text-[#040D1F] ml-1" fill="#040D1F" />
          </div>
        </div>
        
        {/* Title Count Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full 
          bg-[#081229]/80 backdrop-blur-md border border-[rgba(163,207,255,0.2)]">
          <Layers className="w-4 h-4 text-[#00E5FF]" />
          <span className="text-sm font-semibold text-white">{titleCount} Titles</span>
        </div>
      </div>

      {/* Content */}
      <div className={`p-5 ${featured ? "lg:p-7" : ""}`}>
        {/* Collection Title */}
        <h3 className={`font-bold text-white mb-2 leading-tight text-balance
          ${featured ? "text-2xl lg:text-3xl" : "text-xl"}`}>
          {title}
        </h3>
        
        {/* Description */}
        <p className={`text-[#D1D9E6] mb-4 line-clamp-2 ${featured ? "text-base lg:text-lg" : "text-sm"}`}>
          {description}
        </p>

        {/* Anime Previews */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {previews.slice(0, 4).map((anime, index) => (
              <div
                key={anime.id}
                className="relative w-10 h-14 rounded-lg overflow-hidden border-2 border-[#0A1832] 
                  transition-transform duration-300 hover:scale-110 hover:z-10 hover:border-[#00E5FF]/50"
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
          <span className="text-xs text-[#8B9DC3] font-medium">
            +{titleCount - 4} more
          </span>
        </div>
      </div>

      {/* Subtle border glow on hover */}
      <div className="absolute inset-0 rounded-xl border border-transparent 
        group-hover:border-[rgba(0,229,255,0.3)] transition-colors duration-500 pointer-events-none" />
    </article>
  )
}
