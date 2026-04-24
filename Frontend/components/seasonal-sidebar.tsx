"use client"

import { Sparkles } from "lucide-react"
import { AnimeCard } from "./anime-card"

const seasonalAnime = [
  {
    id: "1",
    title: "Shadow Sovereign",
    image: "/images/anime-1.jpg",
    rating: 9.2,
    status: "Airing",
  },
  {
    id: "2",
    title: "Frost Enchantress",
    image: "/images/anime-2.jpg",
    rating: 8.9,
    status: "Airing",
  },
  {
    id: "3",
    title: "Campus Love Story",
    image: "/images/anime-3.jpg",
    rating: 8.5,
    status: "Completed",
  },
  {
    id: "4",
    title: "Mecha Genesis",
    image: "/images/anime-4.jpg",
    rating: 8.7,
    status: "Airing",
  },
  {
    id: "5",
    title: "Detective Noir",
    image: "/images/anime-5.jpg",
    rating: 9.0,
    status: "Airing",
  },
]

export function SeasonalSidebar() {
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
            key={anime.title}
            variant="seasonal"
            {...anime}
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
