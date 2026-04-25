import { HeroHeader } from "@/components/anime/hero-header"
import { SynopsisSection } from "@/components/anime/synopsis-section"
import { VideoPlayer } from "@/components/anime/video-player"
import { EpisodeSelector } from "@/components/anime/episode-selector"
import { GallerySection } from "@/components/anime/gallery-section"
import { getAnimeByID, getAnimes, getAnimePosterUrl } from "@/lib/api"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AnimeTitlePage({ params }: { params: { id: string } }) {
  const anime = await getAnimeByID(params.id).catch(() => null)
  if (!anime) notFound()

  await getAnimes()

  // Mock data for seasons since we don't have it in DB yet
  const seasonsData = [
    {
      id: "season1",
      name: "Season 1",
      episodes: Array.from({ length: anime.episodes || 12 }, (_, i) => ({
        number: i + 1,
        title: `Episode ${i + 1}`,
        duration: "24:00",
      })),
    },
  ]

  const galleryImages = [
    { src: getAnimePosterUrl(anime) || `https://placehold.co/1200x700/081229/00E5FF?text=${encodeURIComponent(anime.name)}`, alt: anime.name },
  ]

  return (
    <div className="pt-16">
      <HeroHeader 
        anime={anime} 
        onStartWatching={() => {}} // This will need client-side handling
      />

      <SynopsisSection anime={anime} />

      <VideoPlayer 
        posterImage={getAnimePosterUrl(anime) || `https://placehold.co/1200x700/081229/00E5FF?text=${encodeURIComponent(anime.name)}`}
        title={anime.name}
        episode={1}
      />

      <EpisodeSelector 
        seasons={seasonsData}
        currentEpisode={1}
        currentSeason="season1"
        onEpisodeSelect={() => {}} // This will need client-side handling
        animeId={anime.id.toString()}
      />

      <GallerySection images={galleryImages} />

      {/* Similar Anime Section needs adaptation */}
      {/* <SimilarAnimeSection animeList={similarAnime} /> */}
    </div>
  )
}
