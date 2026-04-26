import { AnimeDetailsClient } from "@/components/anime/anime-details-client"
import { getAnimeBySlug, getAnimePosterUrl, getAnimes } from "@/lib/api"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AnimeTitlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const details = await getAnimeBySlug(slug).catch(() => null)
  if (!details) notFound()

  const anime = details.anime
  await getAnimes()

  const galleryImages = [
    { src: getAnimePosterUrl(anime) || `https://placehold.co/1200x700/081229/00E5FF?text=${encodeURIComponent(anime.name)}`, alt: anime.name },
  ]

  return <AnimeDetailsClient anime={anime} episodes={details.episodes} galleryImages={galleryImages} />
}
