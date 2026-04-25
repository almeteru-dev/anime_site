import { CatalogClient } from '@/components/catalog/catalog-client'
import { Sparkles } from 'lucide-react'
import { getAnimes } from '@/lib/api'

export const dynamic = "force-dynamic"

export default async function CatalogPage() {
  const animes = await getAnimes()
  
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
        <CatalogClient initialAnimes={animes} />
      </main>
    </div>
  )
}
