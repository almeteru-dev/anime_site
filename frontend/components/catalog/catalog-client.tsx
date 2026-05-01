'use client'

import { useEffect, useMemo, useCallback, useState } from 'react'
import { FilterSidebar, type FilterState } from './filter-sidebar'
import { AnimeGrid } from './anime-grid'
import { MobileFilterSheet } from './mobile-filter-sheet'
import { addToMyCollection, getMyCollection, type Anime, type WatchlistStatus } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import type { AnimeStatus } from '@/components/anime-status-manager'
import { getCollectionMap, setCollectionStatus, subscribeCollection } from '@/lib/collection-cache'

const ITEMS_PER_PAGE = 12

const defaultFilters: FilterState = {
  genres: [],
  status: [],
  yearRange: [1990, 2026],
  types: [],
  studios: [],
  minRating: 0,
}

interface CatalogClientProps {
  initialAnimes: Anime[]
}

export function CatalogClient({ initialAnimes }: CatalogClientProps) {
  const { token, user } = useAuth()
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [userStatuses, setUserStatuses] = useState<Record<string, AnimeStatus>>({})

  useEffect(() => {
    if (!user) {
      setUserStatuses({})
      return
    }

    setUserStatuses(getCollectionMap(user.id))
    const unsub = subscribeCollection(user.id, () => {
      setUserStatuses(getCollectionMap(user.id))
    })
    return unsub
  }, [user])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!token || !user) return
      try {
        const data = await getMyCollection({ token })
        if (!mounted) return
        const next: Record<string, AnimeStatus> = {}
        for (const entry of data) {
          const s = (entry.collection_type?.name || '').toLowerCase() as AnimeStatus
          if (s) next[String(entry.anime_id)] = s
        }
        setUserStatuses(next)
        for (const [animeId, status] of Object.entries(next)) {
          setCollectionStatus(user.id, animeId, status as WatchlistStatus)
        }
      } catch {
        if (!mounted) return
      }
    })()
    return () => {
      mounted = false
    }
  }, [token, user])

  // Filter anime based on applied filters and search query
  const filteredAnime = useMemo(() => {
    if (!initialAnimes) return []

    return initialAnimes.filter((anime: Anime) => {
      // Search query - check original name and all translations
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = anime.name.toLowerCase().includes(query)
        const matchesTranslations = anime.translations?.some(t => t.title.toLowerCase().includes(query))
        if (!matchesName && !matchesTranslations) {
          return false
        }
      }

      // Genres (match any selected genre)
      if (appliedFilters.genres.length > 0) {
        const animeGenreNames = anime.genres?.map(g => g.name) || []
        if (!appliedFilters.genres.some(g => animeGenreNames.includes(g))) {
          return false
        }
      }

      // Status
      if (appliedFilters.status.length > 0 && !appliedFilters.status.includes(anime.status?.name || "")) {
        return false
      }

      // Year range - only filter if aired_on exists, otherwise include it
      if (anime.aired_on) {
        const animeYear = new Date(anime.aired_on).getFullYear()
        if (animeYear < appliedFilters.yearRange[0] || animeYear > appliedFilters.yearRange[1]) {
          return false
        }
      }

      // Type
      if (appliedFilters.types.length > 0 && !appliedFilters.types.includes(anime.kind)) {
        return false
      }

      // Studio
      if (appliedFilters.studios.length > 0 && !appliedFilters.studios.includes(anime.studio?.name || "")) {
        return false
      }

      // Rating
      if (anime.score < appliedFilters.minRating) {
        return false
      }

      return true
    })
  }, [initialAnimes, appliedFilters, searchQuery])

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
          userStatuses={userStatuses}
          onStatusChange={async (animeId, newStatus) => {
            if (!token || !user) return
            if (!newStatus) return

            setUserStatuses((prev) => ({ ...prev, [String(animeId)]: newStatus }))
            setCollectionStatus(user.id, String(animeId), newStatus as WatchlistStatus)
            await addToMyCollection({ animeId: String(animeId), status: newStatus as WatchlistStatus, token })
          }}
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
