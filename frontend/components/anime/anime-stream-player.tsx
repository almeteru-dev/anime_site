"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { ArtVideoPlayer, type ArtVideoPlayerHandle } from "@/components/anime/art-video-player"
import { AddToUserList } from "@/components/anime/add-to-user-list"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import type { Anime, EpisodesByServer, WatchlistStatus, VideoSource, UserListStatus } from "@/lib/api"
import { addToMyCollection, getMyCollection } from "@/lib/api"

type StreamType = "dubbed" | "subbed"

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

function withAutoplay(url: string): string {
  try {
    const u = new URL(url)
    u.searchParams.set("autoplay", "1")
    u.searchParams.set("mute", "1")
    return u.toString()
  } catch {
    return url
  }
}

export function AnimeStreamPlayer({
  anime,
  episodesByServer,
  startWatchingNonce,
}: {
  anime: Anime
  episodesByServer: EpisodesByServer
  startWatchingNonce: number
}) {
  const { token } = useAuth()
  const { locale } = useLanguage()
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const artRef = useRef<ArtVideoPlayerHandle | null>(null)

  const [selectedType, setSelectedType] = useState<StreamType>("dubbed")
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState<number | null>(null)
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null)
  const [resumeAt, setResumeAt] = useState(0)
  const [resumePlay, setResumePlay] = useState(false)
  const [autoplayTrailer, setAutoplayTrailer] = useState(false)
  const [initialListStatus, setInitialStatus] = useState<UserListStatus | null>(null)

  useEffect(() => {
    if (!token) return
    getMyCollection({ token }).then((list) => {
      const entry = list.find((x) => x.anime_id === anime.id)
      if (entry) {
        setInitialStatus(entry.collection_type.name.toLowerCase().replace(" ", "_") as UserListStatus)
      }
    })
  }, [anime.id, token])

  const currentData = useMemo(() => episodesByServer["default"] || null, [episodesByServer])
  const dubbedGroups = currentData?.dub || []
  const subbedGroups = currentData?.sub || []

  useEffect(() => {
    if (!currentData) return
    if (selectedType === "dubbed" && dubbedGroups.length === 0 && subbedGroups.length > 0) {
      setSelectedType("subbed")
      setSelectedGroupId(null)
      setSelectedEpisodeNumber(null)
      return
    }
    if (selectedType === "subbed" && subbedGroups.length === 0 && dubbedGroups.length > 0) {
      setSelectedType("dubbed")
      setSelectedGroupId(null)
      setSelectedEpisodeNumber(null)
    }
  }, [currentData, dubbedGroups.length, selectedType, subbedGroups.length])

  const groupsForType = useMemo(() => {
    return selectedType === "dubbed" ? dubbedGroups : subbedGroups
  }, [dubbedGroups, selectedType, subbedGroups])

  const selectedGroup = useMemo(() => {
    if (!selectedGroupId) return null
    return groupsForType.find((g) => g.id === selectedGroupId) || null
  }, [groupsForType, selectedGroupId])

  const episodeList = useMemo(() => {
    const eps = selectedGroup?.episodes || []
    return eps.slice().sort((a, b) => a.number - b.number)
  }, [selectedGroup])

  const selectedEpisode = useMemo(() => {
    if (!selectedEpisodeNumber) return null
    return episodeList.find((e) => e.number === selectedEpisodeNumber) || null
  }, [episodeList, selectedEpisodeNumber])

  const sources = useMemo(() => {
    return (selectedEpisode?.video_sources || []).filter(s => s.is_active)
  }, [selectedEpisode])

  const selectedSource = useMemo(() => {
    if (!selectedSourceId) return sources.find(s => s.is_default) || sources[0] || null
    return sources.find(s => s.id === selectedSourceId) || sources.find(s => s.is_default) || sources[0] || null
  }, [selectedSourceId, sources])

  const fallbackTrailer = "https://www.youtube.com/watch?v=I1Pk4UUJQg4."
  const trailerUrl = anime.trailer_url || fallbackTrailer

  const activeUrl = selectedSource?.url || trailerUrl
  const kind = selectedSource ? selectedSource.type : "iframe"

  const iframeSrc = useMemo(() => {
    const src = normalizeIFrameUrl(activeUrl)
    if (!autoplayTrailer || !!selectedEpisode) return src
    return withAutoplay(src)
  }, [activeUrl, autoplayTrailer, selectedEpisode])

  const handleUpdateList = async (animeId: string, status: any) => {
    if (!token) throw new Error("Unauthorized")
    await addToMyCollection({ animeId, status: status as WatchlistStatus, token })
  }

  const chooseFirstPlayable = () => {
    if (!currentData || ((currentData.dub?.length || 0) + (currentData.sub?.length || 0) === 0)) {
      setAutoplayTrailer(true)
      return
    }

    const preferredType: StreamType = (currentData.dub?.length || 0) > 0 ? "dubbed" : "subbed"
    setSelectedType(preferredType)

    const firstGroup = (preferredType === "dubbed" ? currentData.dub : currentData.sub)[0]
    if (!firstGroup) {
      setAutoplayTrailer(true)
      return
    }
    setSelectedGroupId(firstGroup.id)
    const firstEpisode = firstGroup.episodes.slice().sort((a, b) => a.number - b.number)[0]
    setSelectedEpisodeNumber(firstEpisode?.number || null)
    
    const defaultSource = firstEpisode?.video_sources.find(s => s.is_default && s.is_active) || firstEpisode?.video_sources.find(s => s.is_active)
    setSelectedSourceId(defaultSource?.id || null)
  }

  useEffect(() => {
    if (!selectedGroupId) {
      const first = groupsForType[0]
      if (first) setSelectedGroupId(first.id)
      return
    }
    if (groupsForType.length > 0 && !groupsForType.some((g) => g.id === selectedGroupId)) {
      setSelectedGroupId(groupsForType[0].id)
    }
  }, [groupsForType, selectedGroupId])

  useEffect(() => {
    if (episodeList.length === 0) {
      if (selectedEpisodeNumber !== null) setSelectedEpisodeNumber(null)
      return
    }
    if (selectedEpisodeNumber === null) return
    if (!episodeList.some((e) => e.number === selectedEpisodeNumber)) setSelectedEpisodeNumber(null)
  }, [episodeList, selectedEpisodeNumber])

  useEffect(() => {
    if (!startWatchingNonce) return
    wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    chooseFirstPlayable()
  }, [startWatchingNonce])

  const switchTo = (nextSource: VideoSource | null) => {
    const wasDirect = kind === "direct"
    const nextKind = nextSource ? nextSource.type : "iframe"
    if (wasDirect && nextKind === "direct") {
      setResumeAt(artRef.current?.getCurrentTime() || 0)
      setResumePlay(artRef.current?.isPlaying() || false)
    } else {
      setResumeAt(0)
      setResumePlay(false)
    }
    setAutoplayTrailer(false)
    if (nextSource) setSelectedSourceId(nextSource.id)
  }

  return (
    <section className="py-6 px-4" ref={wrapperRef}>
      <div className="container mx-auto max-w-5xl">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-[#1A2847] bg-[#081229]">
          {kind === "iframe" ? (
            <iframe
              key={`${selectedType}:${selectedGroupId}:${selectedEpisodeNumber}:${selectedSourceId}:${iframeSrc}`}
              src={iframeSrc}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <ArtVideoPlayer
              key={`${selectedType}:${selectedGroupId}:${selectedEpisodeNumber}:${selectedSourceId}:${activeUrl}`}
              ref={artRef}
              url={activeUrl}
              initialTime={resumeAt}
              autoPlay={resumePlay}
            />
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {sources.length > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-[#1A2847] bg-[#081229] p-1">
                {sources.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => switchTo(s)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                      selectedSource?.id === s.id
                        ? "bg-[#00E5FF] text-[#040D1F]"
                        : "text-[#D1D9E6] hover:text-white hover:bg-[#0D1A3A]"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <AddToUserList 
            animeId={String(anime.id)} 
            onUpdate={handleUpdateList} 
            initialStatus={initialListStatus}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          {(dubbedGroups.length > 0 || subbedGroups.length > 0) ? (
            <>
              {dubbedGroups.length > 0 ? (
                <div>
                  <div className="text-sm font-semibold text-white mb-2">{locale === "ru" ? "Озвучка" : "Dubbed"}</div>
                  <div className="flex flex-wrap gap-2">
                    {dubbedGroups.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => {
                          setSelectedType("dubbed")
                          setSelectedGroupId(g.id)
                          setSelectedEpisodeNumber(null)
                          setSelectedSourceId(null)
                        }}
                        className={cn(
                          "px-4 py-2 rounded-xl border text-sm font-semibold transition-all",
                          selectedType === "dubbed" && selectedGroupId === g.id
                            ? "bg-[#00E5FF]/10 border-[#00E5FF]/50 text-[#00E5FF]"
                            : "bg-[#081229] border-[#1A2847] text-[#D1D9E6] hover:text-white hover:bg-[#0D1A3A]"
                        )}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {subbedGroups.length > 0 ? (
                <div>
                  <div className="text-sm font-semibold text-white mb-2">{locale === "ru" ? "Субтитры" : "Subbed"}</div>
                  <div className="flex flex-wrap gap-2">
                    {subbedGroups.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => {
                          setSelectedType("subbed")
                          setSelectedGroupId(g.id)
                          setSelectedEpisodeNumber(null)
                          setSelectedSourceId(null)
                        }}
                        className={cn(
                          "px-4 py-2 rounded-xl border text-sm font-semibold transition-all",
                          selectedType === "subbed" && selectedGroupId === g.id
                            ? "bg-[#00E5FF]/10 border-[#00E5FF]/50 text-[#00E5FF]"
                            : "bg-[#081229] border-[#1A2847] text-[#D1D9E6] hover:text-white hover:bg-[#0D1A3A]"
                        )}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="text-sm text-[#A3CFFF]">No episodes yet. Trailer is available.</div>
          )}

          {selectedGroupId && episodeList.length > 0 ? (
            <div>
              <div className="text-sm font-semibold text-white mb-2">Episodes</div>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {episodeList.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => {
                      setSelectedEpisodeNumber(ep.number)
                      setSelectedSourceId(null)
                    }}
                    className={cn(
                      "p-3 rounded-lg font-semibold text-sm transition-all duration-300",
                      selectedEpisodeNumber === ep.number
                        ? "bg-[#00E5FF] text-[#040D1F] shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                        : "bg-[#081229] text-[#D1D9E6] border border-[#1A2847] hover:border-[#00E5FF]/50 hover:bg-[#0D1A3A] hover:text-white"
                    )}
                  >
                    {ep.number}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
