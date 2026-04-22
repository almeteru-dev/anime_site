"use client"

import { useState } from "react"
import { Sparkles, Sword, Heart, Compass, Wand2, Skull, Laugh, Star } from "lucide-react"

const filters = [
  { id: "all", label: "All Collections", icon: Star },
  { id: "curators-choice", label: "Curator's Choice", icon: Sparkles },
  { id: "action", label: "Action", icon: Sword },
  { id: "romance", label: "Romance", icon: Heart },
  { id: "adventure", label: "Adventure", icon: Compass },
  { id: "fantasy", label: "Fantasy", icon: Wand2 },
  { id: "horror", label: "Horror", icon: Skull },
  { id: "comedy", label: "Comedy", icon: Laugh },
]

interface FilterButtonsProps {
  onFilterChange?: (filterId: string) => void
}

export function FilterButtons({ onFilterChange }: FilterButtonsProps) {
  const [activeFilter, setActiveFilter] = useState("all")

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId)
    onFilterChange?.(filterId)
  }

  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => {
        const Icon = filter.icon
        const isActive = activeFilter === filter.id
        
        return (
          <button
            key={filter.id}
            onClick={() => handleFilterClick(filter.id)}
            className={`
              inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold
              transition-all duration-300 ease-out
              ${isActive 
                ? "bg-[#00E5FF] text-[#040D1F] shadow-[0_0_20px_rgba(0,229,255,0.4)]" 
                : "bg-[#0A1832] text-[#D1D9E6] border border-[rgba(163,207,255,0.15)] hover:border-[#00E5FF]/50 hover:text-[#00E5FF] hover:shadow-[0_0_15px_rgba(0,229,255,0.15)]"
              }
            `}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-[#040D1F]" : ""}`} />
            <span>{filter.label}</span>
          </button>
        )
      })}
    </div>
  )
}
