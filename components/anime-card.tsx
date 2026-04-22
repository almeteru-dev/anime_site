"use client"

import { Star, Play, Clock, Eye } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface BaseAnimeCardProps {
  id: string
  title: string
  image: string
  rating?: number
}

interface LatestEpisodeCardProps extends BaseAnimeCardProps {
  variant: "latest"
  episode: string
  totalEpisodes: number
  updatedTime: string
}

interface TrendingCardProps extends BaseAnimeCardProps {
  variant: "trending"
  rank: number
  views: string
}

interface TopRatedCardProps extends BaseAnimeCardProps {
  variant: "top-rated"
  genres: string[]
}

interface SeasonalCardProps extends BaseAnimeCardProps {
  variant: "seasonal"
  status: string
}

type AnimeCardProps =
  | LatestEpisodeCardProps
  | TrendingCardProps
  | TopRatedCardProps
  | SeasonalCardProps

export function AnimeCard(props: AnimeCardProps) {
  const { title, image, rating, variant } = props

  if (variant === "latest") {
    const { id, episode, totalEpisodes, updatedTime } = props as LatestEpisodeCardProps
    return (
      <Link href={`/anime/${id}`} className="group relative w-[180px] sm:w-[200px] flex-shrink-0 cursor-pointer">
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-[var(--card-shadow)] transition-all duration-300 group-hover:shadow-[var(--glow-primary)] group-hover:scale-[1.02]">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
          
          {/* Episode Badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-semibold rounded-md">
            Ep. {episode} / {totalEpisodes}
          </div>

          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm animate-glow-pulse">
              <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
            </div>
          </div>
        </div>
        
        {/* Info */}
        <div className="mt-3 px-1">
          <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-1 mt-1.5 text-foreground-muted text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{updatedTime}</span>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "trending") {
    const { id, rank, views } = props as TrendingCardProps
    return (
      <Link href={`/anime/${id}`} className="group relative w-[180px] sm:w-[200px] flex-shrink-0 cursor-pointer">
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-[var(--card-shadow)] transition-all duration-300 group-hover:shadow-[var(--glow-primary)] group-hover:scale-[1.02]">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
          
          {/* Rank Badge */}
          <div className="absolute top-3 left-3 w-10 h-10 flex items-center justify-center">
            <span className={cn(
              "text-3xl font-black italic",
              rank <= 3 ? "text-primary drop-shadow-[0_0_10px_var(--primary)]" : "text-foreground/80"
            )}>
              {rank}
            </span>
          </div>

          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm">
              <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
            </div>
          </div>
        </div>
        
        {/* Info */}
        <div className="mt-3 px-1">
          <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center justify-between mt-1.5">
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-xs font-medium text-primary">{rating}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-foreground-muted text-xs">
              <Eye className="w-3.5 h-3.5" />
              <span>{views}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "top-rated") {
    const { id, genres } = props as TopRatedCardProps
    return (
      <Link href={`/anime/${id}`} className="group relative w-[180px] sm:w-[200px] flex-shrink-0 cursor-pointer">
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-[var(--card-shadow)] transition-all duration-300 group-hover:shadow-[var(--glow-primary)] group-hover:scale-[1.02]">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
          
          {/* Rating Badge */}
          {rating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-background/70 backdrop-blur-sm rounded-md">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="text-xs font-semibold text-primary">{rating}</span>
            </div>
          )}

          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm">
              <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
            </div>
          </div>
        </div>
        
        {/* Info */}
        <div className="mt-3 px-1">
          <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="px-2 py-0.5 text-[10px] font-medium bg-secondary/10 text-secondary border border-secondary/30 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "seasonal") {
    const { id, status } = props as SeasonalCardProps
    return (
      <Link href={`/anime/${id}`} className="group flex gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-[var(--card-shadow)]">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 py-1">
          <h4 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-primary fill-primary" />
                <span className="text-xs font-medium text-primary">{rating}</span>
              </div>
            )}
            <span className="text-xs text-foreground-muted">{status}</span>
          </div>
        </div>
      </Link>
    )
  }

  return null
}
