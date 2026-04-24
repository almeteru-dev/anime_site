import { HeroCarousel } from "@/components/hero-carousel"
import { ContentSection } from "@/components/content-section"
import { AnimeCard } from "@/components/anime-card"
import { SeasonalSidebar } from "@/components/seasonal-sidebar"

const latestEpisodes = [
  {
    id: "1",
    title: "Shadow Sovereign",
    image: "/images/anime-1.jpg",
    episode: "12",
    totalEpisodes: 24,
    updatedTime: "2h ago",
  },
  {
    id: "2",
    title: "Frost Enchantress",
    image: "/images/anime-2.jpg",
    episode: "8",
    totalEpisodes: 12,
    updatedTime: "4h ago",
  },
  {
    id: "3",
    title: "Campus Love Story",
    image: "/images/anime-3.jpg",
    episode: "6",
    totalEpisodes: 12,
    updatedTime: "6h ago",
  },
  {
    id: "4",
    title: "Mecha Genesis",
    image: "/images/anime-4.jpg",
    episode: "15",
    totalEpisodes: 26,
    updatedTime: "8h ago",
  },
  {
    id: "5",
    title: "Detective Noir",
    image: "/images/anime-5.jpg",
    episode: "10",
    totalEpisodes: 13,
    updatedTime: "12h ago",
  },
  {
    id: "6",
    title: "Crimson Blade",
    image: "/images/anime-6.jpg",
    episode: "20",
    totalEpisodes: 26,
    updatedTime: "1d ago",
  },
  {
    id: "7",
    title: "Witch Academy",
    image: "/images/anime-7.jpg",
    episode: "9",
    totalEpisodes: 12,
    updatedTime: "1d ago",
  },
  {
    id: "8",
    title: "Court Champions",
    image: "/images/anime-8.jpg",
    episode: "22",
    totalEpisodes: 25,
    updatedTime: "2d ago",
  },
]

const trendingAnime = [
  {
    id: "1",
    title: "Shadow Sovereign",
    image: "/images/anime-1.jpg",
    rating: 9.2,
    views: "2.4M",
    rank: 1,
  },
  {
    id: "6",
    title: "Crimson Blade",
    image: "/images/anime-6.jpg",
    rating: 9.5,
    views: "2.1M",
    rank: 2,
  },
  {
    id: "2",
    title: "Frost Enchantress",
    image: "/images/anime-2.jpg",
    rating: 8.9,
    views: "1.8M",
    rank: 3,
  },
  {
    id: "5",
    title: "Detective Noir",
    image: "/images/anime-5.jpg",
    rating: 9.0,
    views: "1.5M",
    rank: 4,
  },
  {
    id: "4",
    title: "Mecha Genesis",
    image: "/images/anime-4.jpg",
    rating: 8.7,
    views: "1.2M",
    rank: 5,
  },
]

const topRatedAnime = [
  {
    id: "1",
    title: "Shadow Sovereign",
    image: "/images/anime-1.jpg",
    rating: 9.2,
    genres: ["Action", "Fantasy", "RPG"],
  },
  {
    id: "6",
    title: "Crimson Blade",
    image: "/images/anime-6.jpg",
    rating: 9.5,
    genres: ["Samurai", "Action", "Drama"],
  },
  {
    id: "2",
    title: "Frost Enchantress",
    image: "/images/anime-2.jpg",
    rating: 8.9,
    genres: ["Magic", "Adventure", "Fantasy"],
  },
  {
    id: "5",
    title: "Detective Noir",
    image: "/images/anime-5.jpg",
    rating: 9.0,
    genres: ["Mystery", "Thriller", "Noir"],
  },
]

export default function Home() {
  return (
    <div className="pt-20 lg:pt-0">
      <HeroCarousel />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          <div className="space-y-16">
            <ContentSection title="Latest Episodes" href="/catalog">
              <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {latestEpisodes.map((anime) => (
                  <AnimeCard key={anime.title} variant="latest" {...anime} />
                ))}
              </div>
            </ContentSection>

            <ContentSection title="Trending Now" href="/catalog">
              <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {trendingAnime.map((anime) => (
                  <AnimeCard key={anime.title} variant="trending" {...anime} />
                ))}
              </div>
            </ContentSection>

            <ContentSection title="Top Rated" href="/catalog">
              <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {topRatedAnime.map((anime) => (
                  <AnimeCard key={anime.title} variant="top-rated" {...anime} />
                ))}
              </div>
            </ContentSection>
          </div>

          <aside>
            <SeasonalSidebar />
          </aside>
        </div>
      </div>
    </div>
  )
}
