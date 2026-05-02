"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { addToMyCollection, type Anime, type Episode, type WatchlistStatus } from "@/lib/api"
import { AddToUserList, type UserListStatus } from "@/components/anime/add-to-user-list"
import { ArtVideoPlayer, type ArtVideoPlayerHandle } from "@/components/anime/art-video-player"
import { SourceSelector, type PlayerSource } from "@/components/anime/source-selector"

function extractIframeSrc(input: string): string | null {
  const match = input.match(/src\s*=\s*"([^"]+)"/i)
  return match?.[1] || null
}

function toYouTubeEmbed(input: string): string | null {
  try {
    const u = new URL(input)
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "")
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return input
      const id = u.searchParams.get("v")
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
  } catch {
    return null
  }
  return null
}

function normalizeIFrameUrl(url: string): string {
  const trimmed = url.trim().replace(/\.+$/, "")
  if (trimmed.includes("<iframe")) {
    const src = extractIframeSrc(trimmed)
    return src || trimmed
  }
  const yt = toYouTubeEmbed(trimmed)
  return yt || trimmed
}

function guessKind(url?: string): "iframe" | "direct" | "placeholder" {
  if (!url) return "placeholder"
  const u = url.trim()
  if (!u) return "placeholder"
  if (u.includes("<iframe")) return "iframe"
  if (/youtu\.be|youtube\.com|player\.vimeo\.com/i.test(u)) return "iframe"
  return "direct"
}

export function AnimePlayerContainer({
  anime,
  episode,
  startWatchingNonce,
}: {
  anime: Anime
  episode: Episode | null
  startWatchingNonce?: number
}) {
  const { token } = useAuth()
  const artRef = useRef<ArtVideoPlayerHandle | null>(null)
  const [selectedServer, setSelectedServer] = useState("Server 1")
  const [selectedAudio, setSelectedAudio] = useState("Subbed")
  const [resumeAt, setResumeAt] = useState<number>(0)
  const [resumePlay, setResumePlay] = useState(false)
  const [autoplay, setAutoplay] = useState(false)

  useEffect(() => {
    if (!startWatchingNonce) return
    if (!episode) setAutoplay(true)
  }, [episode, startWatchingNonce])

  const sources = useMemo<PlayerSource[]>(() => {
    const trailerFallback = "https://www.youtube.com/watch?v=I1Pk4UUJQg4"
    const episodeUrl =
      episode?.video_sources?.find((s) => s.is_default && s.is_active)?.url ||
      episode?.video_sources?.find((s) => s.is_active)?.url ||
      episode?.video_sources?.[0]?.url ||
      ""
    const baseUrl = (episodeUrl || anime.trailer_url || trailerFallback).trim()

    const s1: PlayerSource = {
      id: "server1_sub",
      server: "Server 1",
      audio: "Subbed",
      kind: guessKind(baseUrl),
      url: baseUrl,
    }

    const s1Dub: PlayerSource = {
      id: "server1_dub",
      server: "Server 1",
      audio: "Dubbed",
      kind: guessKind(baseUrl),
      url: baseUrl,
    }

    const placeholder: PlayerSource = {
      id: "placeholder",
      server: "Backup",
      audio: "Subbed",
      kind: "placeholder",
    }

    return [s1, s1Dub, placeholder]
  }, [anime.trailer_url, episode?.video_sources])

  const active = useMemo(() => {
    return (
      sources.find((s) => s.server === selectedServer && s.audio === selectedAudio) ||
      sources[0]
    )
  }, [selectedAudio, selectedServer, sources])

  const iframeSrc = useMemo(() => {
    if (active.kind !== "iframe") return ""
    const src = normalizeIFrameUrl(active.url || "")
    if (!autoplay) return src
    try {
      const u = new URL(src)
      u.searchParams.set("autoplay", "1")
      u.searchParams.set("mute", "1")
      return u.toString()
    } catch {
      return src
    }
  }, [active.kind, active.url, autoplay])

  const onChangeServer = (server: string) => {
    if (active.kind === "direct") {
      const t = artRef.current?.getCurrentTime() || 0
      setResumeAt(t)
      setResumePlay(artRef.current?.isPlaying() || false)
    }
    setSelectedServer(server)
    const audios = Array.from(new Set(sources.filter((s) => s.server === server).map((s) => s.audio)))
    if (!audios.includes(selectedAudio)) {
      setSelectedAudio(audios[0] || "Subbed")
    }
  }

  const onChangeAudio = (audio: string) => {
    const next = sources.find((s) => s.server === selectedServer && s.audio === audio)
    if (active.kind === "direct" && next?.kind === "direct") {
      const t = artRef.current?.getCurrentTime() || 0
      setResumeAt(t)
      setResumePlay(artRef.current?.isPlaying() || false)
    } else {
      setResumeAt(0)
      setResumePlay(false)
    }
    setSelectedAudio(audio)
  }

  const handleUpdateList = async (animeId: string, status: UserListStatus) => {
    if (!token) {
      throw new Error("Unauthorized")
    }

    await addToMyCollection({ animeId, status: status as WatchlistStatus, token })
  }

  return (
    <section className="py-6 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-[#1A2847] bg-[#081229]">
          {active.kind === "placeholder" ? (
            <div className="w-full h-full flex items-center justify-center text-[#A3CFFF]">No source</div>
          ) : active.kind === "iframe" ? (
            <iframe
              key={`${active.id}:${active.url || ""}`}
              src={iframeSrc}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <ArtVideoPlayer
              key={`${active.id}:${active.url || ""}`}
              ref={artRef}
              url={active.url || ""}
              initialTime={resumeAt}
              autoPlay={resumePlay}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4">
          <SourceSelector
            sources={sources}
            selectedServer={selectedServer}
            selectedAudio={selectedAudio}
            onChangeServer={onChangeServer}
            onChangeAudio={onChangeAudio}
          />

          <AddToUserList animeId={String(anime.id)} onUpdate={handleUpdateList} />
        </div>
      </div>
    </section>
  )
}
