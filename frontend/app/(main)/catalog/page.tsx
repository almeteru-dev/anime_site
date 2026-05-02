import { CatalogClient } from '@/components/catalog/catalog-client'
import { Sparkles } from 'lucide-react'
import { getAnimes, getCatalogMeta, type GetAnimesParams } from '@/lib/api'

export const dynamic = "force-dynamic"

type CatalogPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>
}

function getFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function parseCsv(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const sp = (await Promise.resolve(searchParams)) || {}

  const params: GetAnimesParams = {
    q: getFirst(sp.q),
    genres: parseCsv(getFirst(sp.genres)),
    types: parseCsv(getFirst(sp.types)),
    statuses: parseCsv(getFirst(sp.statuses)),
    studios: parseCsv(getFirst(sp.studios)),
    sources: parseCsv(getFirst(sp.sources)),
    ratings: parseCsv(getFirst(sp.ratings)),
  }

  const yearFrom = getFirst(sp.year_from)
  const yearTo = getFirst(sp.year_to)
  const minRating = getFirst(sp.min_rating)
  const releaseUnknown = getFirst(sp.release_unknown)

  if (yearFrom && !Number.isNaN(Number(yearFrom))) params.year_from = Number(yearFrom)
  if (yearTo && !Number.isNaN(Number(yearTo))) params.year_to = Number(yearTo)
  if (minRating && !Number.isNaN(Number(minRating))) params.min_rating = Number(minRating)
  if (releaseUnknown && (releaseUnknown === "1" || String(releaseUnknown).toLowerCase() === "true")) {
    params.release_unknown = true
  }

  const [animes, meta] = await Promise.all([
    getAnimes(params),
    getCatalogMeta(),
  ])
  
  return (
    <div className="pt-20">
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-8 lg:mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-accent-primary" />
            <span className="text-sm font-medium text-accent-primary">Explore</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3 text-balance">
            Anime Catalog
          </h1>
          <p className="text-foreground-muted max-w-2xl text-pretty">
            Discover your next favorite anime from our extensive collection. 
            Use the filters to find exactly what you&apos;re looking for.
          </p>
        </div>

        {/* Catalog Content */}
        <CatalogClient initialAnimes={animes} meta={meta} initialSearchParams={sp} />
      </main>
    </div>
  )
}
