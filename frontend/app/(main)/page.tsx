import { HeroCarousel } from "@/components/hero-carousel"
import { ContentSection } from "@/components/content-section"
import { AnimeCard } from "@/components/anime-card"
import { FeaturedSidebar } from "@/components/featured-sidebar"
import { getAnimes, getAnimePosterUrl } from "@/lib/api"

export const dynamic = "force-dynamic"

export default async function Home() {
  const animes = await getAnimes()

  return (
    <div className="pt-20 lg:pt-0">
      <HeroCarousel animes={animes} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          <div className="space-y-16">
            <ContentSection title="Featured Anime">
              {animes.map((anime) => (
                <AnimeCard 
                  key={anime.id} 
                  variant="top-rated" 
                  id={anime.id.toString()}
                  title={anime.name}
                  image={getAnimePosterUrl(anime) || `https://placehold.co/300x450/081229/00E5FF?text=${encodeURIComponent(anime.name)}`}
                  rating={anime.score}
                  genres={anime.genres?.map(g => g.name) || []}
                  data={anime}
                />
              ))}
            </ContentSection>
          </div>

          <aside>
            <FeaturedSidebar animes={animes} />
          </aside>
        </div>
      </div>
    </div>
  )
}
