"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { ArtVideoPlayer, type ArtVideoPlayerHandle } from "@/components/anime/art-video-player"
import { AddToUserList } from "@/components/anime/add-to-user-list"
import { AnimeRating } from "@/components/anime/anime-rating"
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
  const { user } = useAuth()
  const { locale } = useLanguage()
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const artRef = useRef<ArtVideoPlayerHandle | null>(null)

  const [selectedType, setSelectedType] = useState<StreamType>("dubbed")
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState<number | null>(null)
  const [selectedVoiceGroupId, setSelectedVoiceGroupId] = useState<number | null>(null)
  const [selectedServerLabel, setSelectedServerLabel] = useState<string>("")
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null)
  const [resumeAt, setResumeAt] = useState(0)
  const [resumePlay, setResumePlay] = useState(false)
  const [autoplayTrailer, setAutoplayTrailer] = useState(false)
  const [initialListStatus, setInitialStatus] = useState<UserListStatus | null>(null)

  useEffect(() => {
    if (!user) return
    getMyCollection().then((list) => {
      const entry = list.find((x) => x.anime_id === anime.id)
      if (entry) {
        setInitialStatus(entry.collection_type.name.toLowerCase().replace(" ", "_") as UserListStatus)
      }
    })
  }, [anime.id, user])

  const currentData = useMemo(() => episodesByServer["default"] || null, [episodesByServer])

  const integratedGroup = useMemo(() => {
    return (currentData?.dub || []).find((g) => g.id === 0) || null
  }, [currentData])

  const voiceGroupsForType = useMemo(() => {
    const groups = selectedType === "dubbed" ? (currentData?.dub || []) : (currentData?.sub || [])
    return groups.filter((g) => g.id !== 0)
  }, [currentData, selectedType])

  const episodeByGroupId = useMemo(() => {
    const map = new Map<number, Map<number, { id: number; number: number; duration: number; video_sources: VideoSource[] }>>()
    const addGroup = (g: any) => {
      const perEp = new Map<number, any>()
      for (const ep of g.episodes || []) {
        perEp.set(ep.number, ep)
      }
      map.set(g.id, perEp)
    }

    for (const g of currentData?.dub || []) addGroup(g)
    for (const g of currentData?.sub || []) addGroup(g)

    return map
  }, [currentData])

  const sourcesFor = useCallback(
    (groupId: number, epNumber: number): VideoSource[] => {
      const ep = episodeByGroupId.get(groupId)?.get(epNumber)
      return (ep?.video_sources || []).filter((s: any) => s.is_active)
    },
    [episodeByGroupId]
  )

  const mergedEpisodes = useMemo(() => {
    const byNum = new Map<number, { id: number; number: number; duration: number; video_sources: VideoSource[] }>()
    const add = (ep: { id: number; number: number; duration: number; video_sources: VideoSource[] }) => {
      const existing = byNum.get(ep.number)
      if (!existing) {
        byNum.set(ep.number, { id: ep.id, number: ep.number, duration: ep.duration || 0, video_sources: [...(ep.video_sources || [])] })
        return
      }
      const seen = new Set<number>(existing.video_sources.map((s) => s.id))
      for (const s of ep.video_sources || []) {
        if (!seen.has(s.id)) existing.video_sources.push(s)
      }
      if ((ep.duration || 0) > (existing.duration || 0)) existing.duration = ep.duration || 0
    }

    for (const g of currentData?.dub || []) {
      for (const ep of g.episodes || []) add(ep)
    }
    for (const g of currentData?.sub || []) {
      for (const ep of g.episodes || []) add(ep)
    }

    return Array.from(byNum.values()).sort((a, b) => a.number - b.number)
  }, [currentData])

  useEffect(() => {
    if (!mergedEpisodes.length) return
    if (selectedEpisodeNumber === null) setSelectedEpisodeNumber(mergedEpisodes[0].number)
  }, [mergedEpisodes, selectedEpisodeNumber])

  const selectedEpisode = useMemo(() => {
    if (selectedEpisodeNumber === null) return null
    return mergedEpisodes.find((e) => e.number === selectedEpisodeNumber) || null
  }, [mergedEpisodes, selectedEpisodeNumber])

  const integratedSources = useMemo(() => {
    if (!selectedEpisodeNumber || !integratedGroup) return []
    return sourcesFor(integratedGroup.id, selectedEpisodeNumber).filter((s) => !!s.is_integrated_player)
  }, [integratedGroup, selectedEpisodeNumber, episodeByGroupId])

  const hasAnyDub = useMemo(() => {
    if (!selectedEpisodeNumber) return false
    for (const g of (currentData?.dub || []) as any[]) {
      if (g.id === 0) continue
      const any = sourcesFor(g.id, selectedEpisodeNumber).some((s) => !s.is_integrated_player && s.audio === "dub")
      if (any) return true
    }
    return false
  }, [currentData, selectedEpisodeNumber, sourcesFor])

  const hasAnySub = useMemo(() => {
    if (!selectedEpisodeNumber) return false
    for (const g of (currentData?.sub || []) as any[]) {
      if (g.id === 0) continue
      const any = sourcesFor(g.id, selectedEpisodeNumber).some((s) => !s.is_integrated_player && s.audio === "sub")
      if (any) return true
    }
    return false
  }, [currentData, selectedEpisodeNumber, sourcesFor])

  const typedSourcesAllTeams = useMemo(() => {
    if (!selectedEpisodeNumber) return []
    const desired = selectedType === "dubbed" ? "dub" : "sub"
    const out: VideoSource[] = []
    for (const g of voiceGroupsForType as any[]) {
      const srcs = sourcesFor(g.id, selectedEpisodeNumber)
        .filter((s) => !s.is_integrated_player)
        .filter((s) => s.audio === desired)
      out.push(...srcs)
    }
    return out
  }, [selectedEpisodeNumber, selectedType, sourcesFor, voiceGroupsForType])

  const availableVoiceGroups = useMemo(() => {
    if (!selectedEpisodeNumber) return []
    const desired = selectedType === "dubbed" ? "dub" : "sub"
    return voiceGroupsForType.filter((g: any) => {
      const srcs = sourcesFor(g.id, selectedEpisodeNumber)
        .filter((s) => !s.is_integrated_player)
        .filter((s) => s.audio === desired)
        .filter((s) => !selectedServerLabel || s.label === selectedServerLabel)
      return srcs.length > 0
    })
  }, [selectedEpisodeNumber, selectedServerLabel, selectedType, sourcesFor, voiceGroupsForType])

  const sourcesForSelectedTeam = useMemo(() => {
    if (!selectedEpisodeNumber) return []
    if (!selectedVoiceGroupId) return []
    return sourcesFor(selectedVoiceGroupId, selectedEpisodeNumber).filter((s) => !s.is_integrated_player)
  }, [selectedEpisodeNumber, selectedVoiceGroupId, episodeByGroupId])

  const dubSources = useMemo(() => sourcesForSelectedTeam.filter((s) => s.audio === "dub"), [sourcesForSelectedTeam])
  const subSources = useMemo(() => sourcesForSelectedTeam.filter((s) => s.audio === "sub"), [sourcesForSelectedTeam])

  useEffect(() => {
    if (!selectedEpisode) return

    if (availableVoiceGroups.length > 0 && (!selectedVoiceGroupId || !availableVoiceGroups.some((g: any) => g.id === selectedVoiceGroupId))) {
      setSelectedVoiceGroupId(availableVoiceGroups[0].id)
    }

    const currentSources = [...integratedSources, ...(selectedType === "dubbed" ? dubSources : subSources)]
    if (selectedSourceId && currentSources.some((s) => s.id === selectedSourceId)) return

    const pickIntegrated = integratedSources.find((s) => s.is_default) || integratedSources[0]
    if (pickIntegrated) {
      setSelectedSourceId(pickIntegrated.id)
      setSelectedServerLabel(pickIntegrated.label)
      return
    }

    const typed = selectedType === "dubbed" ? dubSources : subSources
    const pick = typed.find((s) => s.is_default) || typed[0] || null
    setSelectedSourceId(pick?.id || null)
    setSelectedServerLabel(pick?.label || "")
  }, [availableVoiceGroups, dubSources, integratedSources, selectedEpisode, selectedSourceId, selectedType, subSources, selectedVoiceGroupId])

  const selectedSource = useMemo(() => {
    const pool = [...integratedSources, ...dubSources, ...subSources]
    if (!selectedSourceId) return pool.find((s) => s.is_default) || pool[0] || null
    return pool.find((s) => s.id === selectedSourceId) || pool.find((s) => s.is_default) || pool[0] || null
  }, [dubSources, integratedSources, selectedSourceId, subSources])

  const hideLanguageSelector = !!selectedSource?.is_integrated_player

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
    if (!user) throw new Error("Unauthorized")
    await addToMyCollection({ animeId, status: status as WatchlistStatus })
  }

  const chooseFirstPlayable = () => {
    if (!mergedEpisodes.length) {
      setAutoplayTrailer(true)
      return
    }
    const firstEpisode = mergedEpisodes[0]
    setSelectedEpisodeNumber(firstEpisode.number)

    const integrated = integratedGroup ? sourcesFor(integratedGroup.id, firstEpisode.number).filter((s) => !!s.is_integrated_player) : []
    const pickIntegrated = integrated.find((s) => s.is_default) || integrated[0]
    if (pickIntegrated) {
      setSelectedSourceId(pickIntegrated.id)
      setSelectedServerLabel(pickIntegrated.label)
      return
    }

    const dubGroups = (currentData?.dub || []).filter((g: any) => g.id !== 0)
    const subGroups = (currentData?.sub || []).filter((g: any) => g.id !== 0)
    const nextType: StreamType = dubGroups.length > 0 ? "dubbed" : "subbed"
    setSelectedType(nextType)

    const groups = nextType === "dubbed" ? dubGroups : subGroups
    const firstGroup = groups.find((g: any) => sourcesFor(g.id, firstEpisode.number).length > 0) || null
    if (!firstGroup) {
      setSelectedSourceId(null)
      setSelectedVoiceGroupId(null)
      setSelectedServerLabel("")
      return
    }

    setSelectedVoiceGroupId(firstGroup.id)
    const teamSources = sourcesFor(firstGroup.id, firstEpisode.number).filter((s) => !s.is_integrated_player)
    const typed = nextType === "dubbed" ? teamSources.filter((s) => s.audio === "dub") : teamSources.filter((s) => s.audio === "sub")
    const pick = typed.find((s) => s.is_default) || typed[0] || null
    setSelectedSourceId(pick?.id || null)
    setSelectedServerLabel(pick?.label || "")
  }

  useEffect(() => {
    if (!mergedEpisodes.length) {
      if (selectedEpisodeNumber !== null) setSelectedEpisodeNumber(null)
      return
    }
    if (selectedEpisodeNumber === null) return
    if (!mergedEpisodes.some((e) => e.number === selectedEpisodeNumber)) setSelectedEpisodeNumber(null)
  }, [mergedEpisodes, selectedEpisodeNumber])

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

  const pickSourceForLabel = useCallback(
    (label: string) => {
    if (!selectedEpisodeNumber) return

    const integrated = integratedSources.filter((s) => s.label === label)
    const pickIntegrated = integrated.find((s) => s.is_default) || integrated[0]
    if (pickIntegrated) {
      setSelectedSourceId(pickIntegrated.id)
      setSelectedServerLabel(label)
      return
    }

    const typed = selectedType === "dubbed" ? dubSources : subSources
    const inCurrentTeam = typed.filter((s) => s.label === label)
    const pickCurrent = inCurrentTeam.find((s) => s.is_default) || inCurrentTeam[0]
    if (pickCurrent) {
      setSelectedSourceId(pickCurrent.id)
      setSelectedServerLabel(label)
      return
    }

    for (const g of availableVoiceGroups as any[]) {
      const groupSources = sourcesFor(g.id, selectedEpisodeNumber).filter((s) => !s.is_integrated_player)
      const typedGroup =
        selectedType === "dubbed"
          ? groupSources.filter((s) => s.audio === "dub")
          : groupSources.filter((s) => s.audio === "sub")
      const matches = typedGroup.filter((s) => s.label === label)
      const pick = matches.find((s) => s.is_default) || matches[0]
      if (pick) {
        setSelectedVoiceGroupId(g.id)
        setSelectedSourceId(pick.id)
        setSelectedServerLabel(label)
        return
      }
    }
    },
    [
      availableVoiceGroups,
      dubSources,
      integratedSources,
      selectedEpisodeNumber,
      selectedType,
      sourcesFor,
      subSources,
    ]
  )

  useEffect(() => {
    if (!selectedServerLabel) return
    pickSourceForLabel(selectedServerLabel)
  }, [pickSourceForLabel, selectedServerLabel])

  const visibleSources = useMemo(() => {
    const list = [...integratedSources, ...typedSourcesAllTeams]
    list.sort((a, b) => {
      if (!!a.is_integrated_player !== !!b.is_integrated_player) return a.is_integrated_player ? -1 : 1
      if (!!a.is_default !== !!b.is_default) return a.is_default ? -1 : 1
      return a.id - b.id
    })
    const seen = new Set<string>()
    const deduped: VideoSource[] = []
    for (const s of list) {
      const key = s.label || String(s.id)
      if (seen.has(key)) continue
      seen.add(key)
      deduped.push(s)
    }
    return deduped
  }, [integratedSources, typedSourcesAllTeams])

  useEffect(() => {
    if (!selectedEpisodeNumber) return
    if (selectedServerLabel && visibleSources.some((s) => s.label === selectedServerLabel)) return
    const first = visibleSources[0]
    if (!first) return
    setSelectedServerLabel(first.label)
  }, [selectedEpisodeNumber, selectedServerLabel, visibleSources])

  return (
    <section className="py-6 px-4" ref={wrapperRef}>
      <div className="container mx-auto max-w-5xl">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border bg-background-secondary">
          {kind === "iframe" ? (
            <iframe
			  key={`${selectedType}:${selectedEpisodeNumber}:${selectedSourceId}:${iframeSrc}`}
              src={iframeSrc}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <ArtVideoPlayer
			  key={`${selectedType}:${selectedEpisodeNumber}:${selectedSourceId}:${activeUrl}`}
              ref={artRef}
              url={activeUrl}
              initialTime={resumeAt}
              autoPlay={resumePlay}
            />
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {visibleSources.length > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background-secondary p-1">
                {visibleSources.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedServerLabel(s.label)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                      selectedServerLabel === s.label
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground-muted hover:text-foreground hover:bg-background-tertiary"
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
          {!hideLanguageSelector && (hasAnyDub || hasAnySub) ? (
            <div>
              <div className="text-sm font-semibold text-foreground mb-2">{locale === "ru" ? "Язык" : "Language"}</div>
              <div className="flex flex-wrap gap-2">
                {hasAnyDub ? (
                  <button
                    onClick={() => {
                      setSelectedType("dubbed")
                      setSelectedSourceId(null)
                      setSelectedVoiceGroupId(null)
                    }}
                    className={cn(
                      "px-4 py-2 rounded-xl border text-sm font-semibold transition-all",
                      selectedType === "dubbed"
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "bg-background-secondary border-border text-foreground-muted hover:text-foreground hover:bg-background-tertiary"
                    )}
                  >
                    {locale === "ru" ? "Озвучка" : "Dubbed"}
                  </button>
                ) : null}
                {hasAnySub ? (
                  <button
                    onClick={() => {
                      setSelectedType("subbed")
                      setSelectedSourceId(null)
                      setSelectedVoiceGroupId(null)
                    }}
                    className={cn(
                      "px-4 py-2 rounded-xl border text-sm font-semibold transition-all",
                      selectedType === "subbed"
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "bg-background-secondary border-border text-foreground-muted hover:text-foreground hover:bg-background-tertiary"
                    )}
                  >
                    {locale === "ru" ? "Субтитры" : "Subbed"}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {!hideLanguageSelector && availableVoiceGroups.length > 0 ? (
            <div>
              <div className="text-sm font-semibold text-foreground mb-2">
					{locale === "ru" ? (selectedType === "dubbed" ? "Озвучка" : "Субтитры") : "Voice group"}
				</div>
              <div className="flex flex-wrap gap-2">
                {availableVoiceGroups.map((g: any) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSelectedVoiceGroupId(g.id)
                    }}
                    className={cn(
                      "px-4 py-2 rounded-xl border text-sm font-semibold transition-all",
                      selectedVoiceGroupId === g.id
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "bg-background-secondary border-border text-foreground-muted hover:text-foreground hover:bg-background-tertiary"
                    )}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {mergedEpisodes.length > 0 ? (
            <div>
              <div className="text-sm font-semibold text-foreground mb-2">{locale === "ru" ? "Серии" : "Episodes"}</div>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {mergedEpisodes.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => {
                      setSelectedEpisodeNumber(ep.number)
                      setSelectedSourceId(null)
                    }}
                    className={cn(
                      "p-3 rounded-lg font-semibold text-sm transition-all duration-300",
                      selectedEpisodeNumber === ep.number
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-background-secondary text-foreground-muted border border-border hover:border-primary/25 hover:bg-background-tertiary hover:text-foreground"
                    )}
                  >
                    {ep.number}
                  </button>
                ))}
              </div>

				<div className="mt-3">
					<AnimeRating animeId={anime.id} />
				</div>
            </div>
          ) : !hideLanguageSelector ? (
            <div className="text-sm text-foreground-subtle">No episodes yet. Trailer is available.</div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
