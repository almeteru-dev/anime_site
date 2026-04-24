"use client"

import { useState, useRef } from "react"
import { HeroHeader } from "@/components/anime/hero-header"
import { SynopsisSection } from "@/components/anime/synopsis-section"
import { VideoPlayer } from "@/components/anime/video-player"
import { EpisodeSelector } from "@/components/anime/episode-selector"
import { GallerySection } from "@/components/anime/gallery-section"
import { SimilarAnimeSection } from "@/components/anime/similar-anime"

// Mock data for the anime
const animeData = {
  title: "Jujutsu Kaisen",
  japaneseTitle: "呪術廻戦",
  rating: 8.9,
  year: 2020,
  status: "Ongoing" as const,
  studio: "MAPPA",
  episodes: 48,
  duration: "24 min/ep",
  genres: ["Action", "Supernatural", "School", "Shounen", "Fantasy"],
  coverImage: "/images/hero-bg.jpg",
}

const synopsisData = {
  synopsis: `Idly indulging in baseless paranormal activities with the Occult Club, high schooler Yuuji Itadori spends his days at either the clubroom or the hospital, where he visits his bedridden grandfather. However, this leisurely lifestyle soon takes a turn for the strange when he unknowingly encounters a cursed item. Triggering a chain of supernatural occurrences, Yuuji finds himself suddenly thrust into the world of Curses—dreadful beings formed from human malice and negativity—after swallowing the said item, revealed to be a finger belonging to the demon Sukuna Ryoumen, the "King of Curses."

Yuuji experiences first-hand the threat these Curses pose to society as he discovers his own newly-acquired powers. Introduced to the Tokyo Jujutsu High School, he begins to walk down a path from which he cannot return—the path of a Jujutsu sorcerer.`,
  alternativeTitles: {
    english: "Jujutsu Kaisen",
    japanese: "呪術廻戦",
    romaji: "Jujutsu Kaisen",
  },
  details: {
    type: "TV Series",
    source: "Manga",
    premiered: "Fall 2020",
    aired: "Oct 3, 2020 - Present",
    duration: "23 min per ep",
    rating: "R - 17+ (Violence & Profanity)",
  },
}

const seasonsData = [
  {
    id: "season1",
    name: "Season 1",
    episodes: Array.from({ length: 24 }, (_, i) => ({
      number: i + 1,
      title: `Episode ${i + 1}`,
      duration: "24:00",
      isFiller: i === 12 || i === 13,
    })),
  },
  {
    id: "season2",
    name: "Season 2",
    episodes: Array.from({ length: 24 }, (_, i) => ({
      number: i + 1,
      title: `Episode ${i + 1}`,
      duration: "24:00",
    })),
  },
  {
    id: "ova",
    name: "OVA",
    episodes: [
      { number: 1, title: "Jujutsu Kaisen 0", duration: "1:45:00" },
    ],
  },
]

const galleryImages = [
  { src: "/images/gallery-1.jpg", alt: "Yuji Itadori Battle Scene" },
  { src: "/images/gallery-2.jpg", alt: "Jujutsu High School" },
  { src: "/images/gallery-3.jpg", alt: "Team Jujutsu Sorcerers" },
  { src: "/images/gallery-4.jpg", alt: "Epic Curse Battle" },
  { src: "/images/gallery-5.jpg", alt: "Mystical Temple" },
  { src: "/images/gallery-6.jpg", alt: "Character Close-up" },
]

const similarAnime = [
  {
    id: "demon-slayer",
    title: "Demon Slayer: Kimetsu no Yaiba",
    coverImage: "/images/similar-1.jpg",
    rating: 8.7,
    year: 2019,
    episodes: 26,
    genres: ["Action", "Supernatural"],
  },
  {
    id: "chainsaw-man",
    title: "Chainsaw Man",
    coverImage: "/images/similar-2.jpg",
    rating: 8.5,
    year: 2022,
    episodes: 12,
    genres: ["Action", "Horror"],
  },
  {
    id: "mob-psycho",
    title: "Mob Psycho 100",
    coverImage: "/images/similar-3.jpg",
    rating: 8.6,
    year: 2016,
    episodes: 37,
    genres: ["Action", "Comedy"],
  },
  {
    id: "hunter-x-hunter",
    title: "Hunter x Hunter (2011)",
    coverImage: "/images/similar-4.jpg",
    rating: 9.0,
    year: 2011,
    episodes: 148,
    genres: ["Action", "Adventure"],
  },
]

export default function AnimeTitlePage() {
  const [currentEpisode, setCurrentEpisode] = useState(1)
  const [currentSeason, setCurrentSeason] = useState("season1")
  const playerRef = useRef<HTMLDivElement>(null)

  const handleStartWatching = () => {
    playerRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleEpisodeSelect = (seasonId: string, episodeNumber: number) => {
    setCurrentSeason(seasonId)
    setCurrentEpisode(episodeNumber)
    playerRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="pt-16">
      
      {/* Hero Header with Cinematic Background */}
      <HeroHeader 
        anime={animeData} 
        onStartWatching={handleStartWatching}
      />

      {/* Synopsis & Details */}
      <SynopsisSection 
        synopsis={synopsisData.synopsis}
        alternativeTitles={synopsisData.alternativeTitles}
        details={synopsisData.details}
      />

      {/* Video Player */}
      <div ref={playerRef}>
        <VideoPlayer 
          posterImage={animeData.coverImage}
          title={animeData.title}
          episode={currentEpisode}
        />
      </div>

      {/* Episode Selector */}
      <EpisodeSelector 
        seasons={seasonsData}
        currentEpisode={currentEpisode}
        currentSeason={currentSeason}
        onEpisodeSelect={handleEpisodeSelect}
        animeId="jujutsu-kaisen"
      />

      {/* Gallery Section */}
      <GallerySection images={galleryImages} />

      {/* Similar Anime */}
      <SimilarAnimeSection animeList={similarAnime} />
    </div>
  )
}
