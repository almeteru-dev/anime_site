import { HeroCarousel } from "@/components/hero-carousel"
import { FeaturedSidebar } from "@/components/featured-sidebar"
import { FeaturedAnimeSection } from "@/components/home/featured-anime-section"
import { getAnimes } from "@/lib/api"

export const dynamic = "force-dynamic"

export default async function Home() {
  const animes = await getAnimes()

  return (
    <div className="pt-20 lg:pt-0">
      <HeroCarousel animes={animes} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          <div className="space-y-16">
            <FeaturedAnimeSection animes={animes} />
          </div>

          <aside>
            <FeaturedSidebar animes={animes} />
          </aside>
        </div>
      </div>
    </div>
  )
}
