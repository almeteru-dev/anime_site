"use client"

import { Sparkles } from "lucide-react"
import { AnimeCard } from "./anime-card"
import { type Anime, getAnimePosterUrl, getLocalizedTitle } from "@/lib/api"
import { useLanguage } from "@/contexts/language-context"

interface SeasonalSidebarProps {
  animes: Anime[]
}

export function SeasonalSidebar({ animes }: SeasonalSidebarProps) {
  const { locale } = useLanguage()
  // Use the last 5 animes as seasonal for now
  const seasonalAnime = animes.slice(-5)

  return (
    <aside className="w-full lg:w-80 bg-background-secondary/50 rounded-2xl p-5 border border-border">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Seasonal Must-Watch</h3>
          <p className="text-xs text-foreground-muted">Spring 2026</p>
        </div>
      </div>

      {/* Anime List */}
      <div className="space-y-2">
        {seasonalAnime.map((anime) => (
          <AnimeCard
            key={anime.id}
            variant="seasonal"
            id={anime.id.toString()}
            title={getLocalizedTitle(anime, locale)}
            image={getAnimePosterUrl(anime) || `https://placehold.co/300x450/081229/00E5FF?text=${encodeURIComponent(getLocalizedTitle(anime, locale))}`}
            rating={anime.score}
            status={anime.status?.name || ""}
            data={anime}
          />
        ))}
      </div>

      {/* View All Button */}
      <button className="w-full mt-4 py-2.5 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors">
        View All Seasonal
      </button>
    </aside>
  )
}
