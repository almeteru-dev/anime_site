'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, Play, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Anime } from '@/lib/anime-data'
import Link from 'next/link'

interface AnimeCardProps {
  anime: Anime
}

export function AnimeCard({ anime }: AnimeCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  const displayGenres = anime.genres.slice(0, 2)

  return (
    <Link
      href={`/anime/${anime.id}`}
      className="group relative rounded-xl overflow-hidden transition-all duration-300 block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Container with Inner Shadow */}
      <div className={cn(
        "relative aspect-[2/3] rounded-xl overflow-hidden card-shadow transition-all duration-300",
        isHovered && "glow-cyan"
      )}>
        {/* Poster Image */}
        <Image
          src={imageError ? `https://placehold.co/300x450/081229/00E5FF?text=${encodeURIComponent(anime.title)}` : anime.poster}
          alt={anime.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          onError={() => setImageError(true)}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-lg bg-background/80 backdrop-blur-sm px-2 py-1">
          <Star className="h-3.5 w-3.5 fill-accent-primary text-accent-primary" />
          <span className="text-xs font-semibold text-foreground">{anime.rating.toFixed(1)}</span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-semibold border-0 backdrop-blur-sm",
              anime.status === 'Ongoing'
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-accent-muted/20 text-accent-muted"
            )}
          >
            {anime.status}
          </Badge>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Title */}
          <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-2 text-balance">
            {anime.title}
          </h3>

          {/* Genre Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {displayGenres.map(genre => (
              <span
                key={genre}
                className="rounded-md bg-background-secondary/80 px-2 py-0.5 text-[10px] font-medium text-foreground-muted backdrop-blur-sm"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Episodes */}
          <div className="flex items-center gap-2 text-[11px] text-foreground-subtle">
            <span>{anime.episodes} EP</span>
            <span className="w-1 h-1 rounded-full bg-foreground-subtle" />
            <span>{anime.type}</span>
            <span className="w-1 h-1 rounded-full bg-foreground-subtle" />
            <span>{anime.year}</span>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className={cn(
          "absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col justify-between p-4 transition-all duration-300",
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          {/* Synopsis */}
          <div className="pt-2">
            <h3 className="text-sm font-bold text-foreground mb-2 line-clamp-2">
              {anime.title}
            </h3>
            <p className="text-xs text-foreground-muted line-clamp-5 leading-relaxed">
              {anime.synopsis}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button className="flex items-center justify-center gap-2 w-full rounded-lg bg-accent-primary py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-accent-secondary">
              <Play className="h-4 w-4 fill-current" />
              Watch Now
            </button>
            <button className="flex items-center justify-center gap-2 w-full rounded-lg border border-accent-muted/50 bg-transparent py-2.5 text-xs font-semibold text-foreground transition-all hover:bg-background-secondary hover:border-accent-primary">
              <Info className="h-4 w-4" />
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
