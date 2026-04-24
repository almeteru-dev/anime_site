'use client'

import { useState, useMemo, useCallback } from 'react'
import { FilterSidebar, type FilterState } from './filter-sidebar'
import { AnimeGrid } from './anime-grid'
import { MobileFilterSheet } from './mobile-filter-sheet'
import { animeData, type Anime } from '@/lib/anime-data'

const ITEMS_PER_PAGE = 12

const defaultFilters: FilterState = {
  genres: [],
  status: [],
  yearRange: [1990, 2024],
  types: [],
  studios: [],
  minRating: 0,
}

export function CatalogClient() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Filter anime based on applied filters and search query
  const filteredAnime = useMemo(() => {
    return animeData.filter((anime: Anime) => {
      // Search query
      if (searchQuery && !anime.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Genres (match any selected genre)
      if (appliedFilters.genres.length > 0 && !appliedFilters.genres.some(g => anime.genres.includes(g))) {
        return false
      }

      // Status
      if (appliedFilters.status.length > 0 && !appliedFilters.status.includes(anime.status)) {
        return false
      }

      // Year range
      if (anime.year < appliedFilters.yearRange[0] || anime.year > appliedFilters.yearRange[1]) {
        return false
      }

      // Type
      if (appliedFilters.types.length > 0 && !appliedFilters.types.includes(anime.type)) {
        return false
      }

      // Studio
      if (appliedFilters.studios.length > 0 && !appliedFilters.studios.includes(anime.studio)) {
        return false
      }

      // Rating
      if (anime.rating < appliedFilters.minRating) {
        return false
      }

      return true
    })
  }, [appliedFilters, searchQuery])

  // Paginate results
  const totalPages = Math.ceil(filteredAnime.length / ITEMS_PER_PAGE)
  const paginatedAnime = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAnime.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredAnime, currentPage])

  // Handlers
  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(filters)
    setCurrentPage(1)
  }, [filters])

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
    setCurrentPage(1)
  }, [])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Anime Grid */}
        <AnimeGrid
          anime={paginatedAnime}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onMobileFilterToggle={() => setMobileFiltersOpen(true)}
        />
      </div>

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </>
  )
}
