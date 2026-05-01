"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { ArtVideoPlayer, type ArtVideoPlayerHandle } from "@/components/anime/art-video-player"
import { AddToUserList } from "@/components/anime/add-to-user-list"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import type { Anime, EpisodesByServer, WatchlistStatus } from "@/lib/api"
import { addToMyCollection } from "@/lib/api"
import { ChevronDown, Headphones } from "lucide-react"
import { getCollectionMap, setCollectionStatus } from "@/lib/collection-cache"

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

function sourceKind(url: string): "iframe" | "direct" {
  const u = url.trim()
  if (u.includes("<iframe")) return "iframe"
  if (/youtu\.be|youtube\.com|player\.vimeo\.com/i.test(u)) return "iframe"
  return "direct"
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
  const { token, user } = useAuth()
  const { locale } = useLanguage()
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const artRef = useRef<ArtVideoPlayerHandle | null>(null)

  const [selectedServer, setSelectedServer] = useState<number>(1)
  const [selectedType, setSelectedType] = useState<StreamType>("dubbed")
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState<number | null>(null)
  const [resumeAt, setResumeAt] = useState(0)
  const [resumePlay, setResumePlay] = useState(false)
  const [autoplayTrailer, setAutoplayTrailer] = useState(false)
  const [listStatus, setListStatus] = useState<WatchlistStatus | null>(null)

  const serverNumbers = useMemo(() => {
    const nums = Object.keys(episodesByServer)
      .map((k) => {
        const m = k.match(/^server_(\d+)$/)
        return m ? Number(m[1]) : null
      })
      .filter((n): n is number => typeof n === "number" && n >= 1 && n <= 3)
    const unique = Array.from(new Set(nums))
    unique.sort((a, b) => a - b)
    return unique.length ? unique : [1, 2, 3]
  }, [episodesByServer])

  const currentServer = useMemo(() => episodesByServer[`server_${selectedServer}`] || null, [episodesByServer, selectedServer])
  const dubbedGroups = currentServer?.dub || []
  const subbedGroups = currentServer?.sub || []

  useEffect(() => {
    if (!currentServer) return
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
  }, [currentServer, dubbedGroups.length, selectedType, subbedGroups.length])

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

  const fallbackTrailer = "https://www.youtube.com/watch?v=I1Pk4UUJQg4."
  const trailerUrl = anime.trailer_url || fallbackTrailer

  const activeUrl = selectedEpisode?.video_url || trailerUrl
  const kind = sourceKind(activeUrl)

  const iframeSrc = useMemo(() => {
    const src = normalizeIFrameUrl(activeUrl)
    if (!autoplayTrailer || !!selectedEpisode) return src
    return withAutoplay(src)
  }, [activeUrl, autoplayTrailer, selectedEpisode])

  const handleUpdateList = async (animeId: string, status: WatchlistStatus) => {
    if (!token) throw new Error("Unauthorized")
    await addToMyCollection({ animeId, status, token })
    setListStatus(status)
    if (user) setCollectionStatus(user.id, animeId, status)
  }

  useEffect(() => {
    if (!user) {
      setListStatus(null)
      return
    }
    const m = getCollectionMap(user.id)
    setListStatus((m[String(anime.id)] as WatchlistStatus | undefined) || null)
  }, [anime.id, user])

  const chooseFirstPlayable = () => {
    const hasAny = serverNumbers.some((n) => {
      const s = episodesByServer[`server_${n}`]
      if (!s) return false
      return (s.dub?.length || 0) + (s.sub?.length || 0) > 0
    })
    if (!hasAny) {
      setAutoplayTrailer(true)
      return
    }

    const preferredServerNumber = serverNumbers.includes(1) ? 1 : serverNumbers[0]
    setSelectedServer(preferredServerNumber)

    const preferredServer = episodesByServer[`server_${preferredServerNumber}`]
    if (!preferredServer) {
      setAutoplayTrailer(true)
      return
    }

    const preferredType: StreamType = (preferredServer.dub?.length || 0) > 0 ? "dubbed" : "subbed"
    setSelectedType(preferredType)

    const firstGroup = (preferredType === "dubbed" ? preferredServer.dub : preferredServer.sub)[0]
    if (!firstGroup) {
      setAutoplayTrailer(true)
      return
    }
    setSelectedGroupId(firstGroup.id)
    const firstEpisode = firstGroup.episodes.slice().sort((a, b) => a.number - b.number)[0]
    setSelectedEpisodeNumber(firstEpisode?.number || null)
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

  const switchTo = (nextUrl: string) => {
    const wasDirect = kind === "direct"
    const nextKind = sourceKind(nextUrl)
    if (wasDirect && nextKind === "direct") {
      setResumeAt(artRef.current?.getCurrentTime() || 0)
      setResumePlay(artRef.current?.isPlaying() || false)
    } else {
      setResumeAt(0)
      setResumePlay(false)
    }
    setAutoplayTrailer(false)
  }

  const categoryLabel = (type: StreamType) => {
    if (type === "dubbed") return locale === "ru" ? "Озвучка" : "Dubbed"
    return locale === "ru" ? "Субтитры" : "Subbed"
  }

  return (
    <section className="py-6 px-4" ref={wrapperRef}>
      <div className="container mx-auto max-w-5xl">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-[#1A2847] bg-[#081229]">
          {kind === "iframe" ? (
            <iframe
              key={`${selectedServer}:${selectedType}:${selectedGroupId}:${selectedEpisodeNumber}:${iframeSrc}`}
              src={iframeSrc}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <ArtVideoPlayer
              key={`${selectedServer}:${selectedType}:${selectedGroupId}:${selectedEpisodeNumber}:${activeUrl}`}
              ref={artRef}
              url={activeUrl}
              initialTime={resumeAt}
              autoPlay={resumePlay}
            />
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#1A2847] bg-[#081229] p-1">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => {
                  setSelectedServer(n)
                  setSelectedGroupId(null)
                  setSelectedEpisodeNumber(null)
                  setAutoplayTrailer(false)
                }}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                  selectedServer === n
                    ? "bg-[#00E5FF] text-[#040D1F]"
                    : "text-[#D1D9E6] hover:text-white hover:bg-[#0D1A3A]"
                )}
              >
                Server {n}
              </button>
            ))}
          </div>

          <AddToUserList animeId={String(anime.id)} onUpdate={handleUpdateList} initialStatus={listStatus} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          {(dubbedGroups.length > 0 || subbedGroups.length > 0) ? (
            <div className="flex flex-wrap items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#1A2847] bg-[#081229] px-4 py-2 text-sm font-semibold text-[#D1D9E6] hover:bg-[#0D1A3A] hover:text-white"
                  >
                    <Headphones className="w-4 h-4 text-[#00E5FF]" />
                    <span className="min-w-0 truncate">{categoryLabel(selectedType)}</span>
                    <ChevronDown className="w-4 h-4 opacity-80" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 border border-[#1A2847] bg-[#081229] text-[#D1D9E6]">
                  {dubbedGroups.length > 0 ? (
                    <>
                      <DropdownMenuLabel className="text-xs text-[#A3CFFF]">{categoryLabel("dubbed")}</DropdownMenuLabel>
                      {dubbedGroups.map((g) => (
                        <DropdownMenuItem
                          key={`dub-${g.id}`}
                          onSelect={() => {
                            setSelectedType("dubbed")
                            setSelectedGroupId(g.id)
                            setSelectedEpisodeNumber(null)
                            switchTo(g.episodes[0]?.video_url || trailerUrl)
                          }}
                          className={cn(
                            "cursor-pointer",
                            selectedType === "dubbed" && selectedGroupId === g.id && "bg-[#00E5FF]/10 text-[#00E5FF]"
                          )}
                        >
                          {g.name}
                        </DropdownMenuItem>
                      ))}
                    </>
                  ) : null}

                  {dubbedGroups.length > 0 && subbedGroups.length > 0 ? <DropdownMenuSeparator className="bg-[#1A2847]" /> : null}

                  {subbedGroups.length > 0 ? (
                    <>
                      <DropdownMenuLabel className="text-xs text-[#A3CFFF]">{categoryLabel("subbed")}</DropdownMenuLabel>
                      {subbedGroups.map((g) => (
                        <DropdownMenuItem
                          key={`sub-${g.id}`}
                          onSelect={() => {
                            setSelectedType("subbed")
                            setSelectedGroupId(g.id)
                            setSelectedEpisodeNumber(null)
                            switchTo(g.episodes[0]?.video_url || trailerUrl)
                          }}
                          className={cn(
                            "cursor-pointer",
                            selectedType === "subbed" && selectedGroupId === g.id && "bg-[#00E5FF]/10 text-[#00E5FF]"
                          )}
                        >
                          {g.name}
                        </DropdownMenuItem>
                      ))}
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>

              {selectedGroup ? (
                <div className="text-sm text-[#A3CFFF]">
                  {locale === "ru" ? "Группа:" : "Group:"} <span className="text-white font-semibold">{selectedGroup.name}</span>
                </div>
              ) : null}
            </div>
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
                      switchTo(ep.video_url)
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
