'use client'

import { useState } from 'react'
import { Filter, RotateCcw, ChevronDown } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { genres, studios, types, statuses } from '@/lib/anime-data'
import { cn } from '@/lib/utils'

export interface FilterState {
  genres: string[]
  status: string[]
  yearRange: [number, number]
  types: string[]
  studios: string[]
  minRating: number
}

interface FilterSidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onApply: () => void
  onReset: () => void
}

interface FilterSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function FilterSection({ title, defaultOpen = true, children }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border/50 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-sm font-semibold text-foreground hover:text-accent-primary transition-colors"
      >
        {title}
        <ChevronDown className={cn(
          "h-4 w-4 text-foreground-subtle transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>
      <div className={cn(
        "grid transition-all duration-200",
        isOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

export function FilterSidebar({ filters, onFiltersChange, onApply, onReset }: FilterSidebarProps) {
  const toggleGenre = (genre: string) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre]
    onFiltersChange({ ...filters, genres: newGenres })
  }

  const toggleStatus = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status]
    onFiltersChange({ ...filters, status: newStatuses })
  }

  const toggleType = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type]
    onFiltersChange({ ...filters, types: newTypes })
  }

  const toggleStudio = (studio: string) => {
    const newStudios = filters.studios.includes(studio)
      ? filters.studios.filter(s => s !== studio)
      : [...filters.studios, studio]
    onFiltersChange({ ...filters, studios: newStudios })
  }

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="sticky top-20 rounded-xl border border-border/50 bg-background-secondary/50 backdrop-blur-sm card-shadow">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-accent-primary" />
            <span className="text-sm font-semibold text-foreground">Filters</span>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-medium text-foreground-subtle hover:text-accent-primary transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        <div className="px-5">
          {/* Genres */}
          <FilterSection title="Genres">
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                    filters.genres.includes(genre)
                      ? "bg-accent-primary text-primary-foreground glow-cyan-sm"
                      : "bg-background-tertiary text-foreground-muted hover:bg-background hover:text-foreground border border-border/50 hover:border-accent-muted/50"
                  )}
                >
                  {genre}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Status */}
          <FilterSection title="Status">
            <div className="flex flex-col gap-2">
              {statuses.map(status => (
                <label
                  key={status}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <Checkbox
                    checked={filters.status.includes(status)}
                    onCheckedChange={() => toggleStatus(status)}
                    className="border-border data-[state=checked]:bg-accent-primary data-[state=checked]:border-accent-primary"
                  />
                  <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Year Range */}
          <FilterSection title="Year">
            <div className="space-y-4">
              <Slider
                value={filters.yearRange}
                min={1990}
                max={2026}
                step={1}
                onValueChange={(value) => onFiltersChange({ ...filters, yearRange: value as [number, number] })}
                className="[&_[data-slot=slider-track]]:bg-background-tertiary [&_[data-slot=slider-range]]:bg-accent-primary [&_[data-slot=slider-thumb]]:border-accent-primary [&_[data-slot=slider-thumb]]:bg-background"
              />
              <div className="flex items-center justify-between text-xs text-foreground-muted">
                <span className="px-2 py-1 rounded bg-background-tertiary">{filters.yearRange[0]}</span>
                <span className="text-foreground-subtle">to</span>
                <span className="px-2 py-1 rounded bg-background-tertiary">{filters.yearRange[1]}</span>
              </div>
            </div>
          </FilterSection>

          {/* Type */}
          <FilterSection title="Type">
            <div className="flex flex-wrap gap-2">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                    filters.types.includes(type)
                      ? "bg-accent-primary text-primary-foreground glow-cyan-sm"
                      : "bg-background-tertiary text-foreground-muted hover:bg-background hover:text-foreground border border-border/50 hover:border-accent-muted/50"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Studio */}
          <FilterSection title="Studio" defaultOpen={false}>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {studios.map(studio => (
                <label
                  key={studio}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <Checkbox
                    checked={filters.studios.includes(studio)}
                    onCheckedChange={() => toggleStudio(studio)}
                    className="border-border data-[state=checked]:bg-accent-primary data-[state=checked]:border-accent-primary"
                  />
                  <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
                    {studio}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Rating */}
          <FilterSection title="Minimum Rating">
            <div className="space-y-4">
              <Slider
                value={[filters.minRating]}
                min={0}
                max={10}
                step={0.5}
                onValueChange={(value) => onFiltersChange({ ...filters, minRating: value[0] })}
                className="[&_[data-slot=slider-track]]:bg-background-tertiary [&_[data-slot=slider-range]]:bg-accent-primary [&_[data-slot=slider-thumb]]:border-accent-primary [&_[data-slot=slider-thumb]]:bg-background"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground-subtle">0</span>
                <span className="px-3 py-1 rounded-lg bg-accent-primary/10 text-accent-primary font-semibold">
                  {filters.minRating}+
                </span>
                <span className="text-foreground-subtle">10</span>
              </div>
            </div>
          </FilterSection>
        </div>

        {/* Apply Button */}
        <div className="p-5">
          <button
            onClick={onApply}
            className="w-full rounded-lg bg-accent-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-accent-secondary hover:glow-cyan"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </aside>
  )
}
