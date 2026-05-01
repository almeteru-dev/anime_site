export interface Language {
  id: number
  code: string
  name: string
}

export interface Genre {
  id: number
  name: string
}

export interface Studio {
  id: number
  name: string
}

export interface KindOption {
  id: number
  name: string
}

export interface RatingOption {
  id: number
  name: string
}

export interface Status {
  id: number
  name: string
}

export interface Source {
  id: number
  name: string
}

export interface AnimeTranslation {
  id: number
  anime_id: number
  language_id: number
  title: string
  description: string
  language: Language
}

export interface VoiceGroup {
  id: number
  name: string
  type: "dub" | "sub"
}

export interface VideoSource {
  id: number
  episode_id: number
  label: string
  type: "iframe" | "direct"
  url: string
  is_default: boolean
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Episode {
  id: number
  anime_id: number
  group_id: number
  number: number
  duration: number
  created_at: string
  voice_group: VoiceGroup
  video_sources?: VideoSource[]
}

export interface EpisodeItem {
  id: number
  number: number
  duration: number
  group_id: number
  video_sources: VideoSource[]
}

export interface EpisodeGroup {
  id: number
  name: string
  type: "dub" | "sub"
  episodes: EpisodeItem[]
}

export type EpisodesByServer = Record<string, { dub: EpisodeGroup[]; sub: EpisodeGroup[] }>

export interface AnimeDetailsResponse {
  anime: Anime
  episodes: EpisodesByServer
}

export interface Anime {
  id: number
  studio_id: number | null
  status_id: number | null
  source_id: number | null
  name: string
  kind: string
  url: string
  duration: number
  rating: string
  image_url: string
  image?: string
  trailer_url?: string
  score: number
  episodes: number
  episodes_aired: number
  aired_on: string | null
  released_on: string | null
  studio: Studio | null
  status: Status | null
  source: Source | null
  genres: Genre[] | null
  translations: AnimeTranslation[] | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

export async function getAnimes(): Promise<Anime[]> {
  const res = await fetch(`${API_URL}/animes`, {
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error("Failed to fetch animes")
  }
  return res.json()
}

export async function getAnimeByID(id: string): Promise<Anime> {
  const res = await fetch(`${API_URL}/animes/${id}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error("Failed to fetch anime")
  }
  return res.json()
}

export async function getAnimeBySlug(slug: string): Promise<AnimeDetailsResponse> {
  const res = await fetch(`${API_URL}/animes/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to fetch anime")
  }
  const data = await res.json()
  return (data.anime ? data : { anime: data, episodes: {} }) as AnimeDetailsResponse
}

export async function getAnimeEpisodes(id: string): Promise<Episode[]> {
  const res = await fetch(`${API_URL}/animes/${id}/episodes`, {
    cache: "no-store",
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to fetch episodes")
  }
  return res.json()
}

export async function getAnimeEpisodesBySlug(slug: string): Promise<Episode[]> {
  const res = await fetch(`${API_URL}/animes/${encodeURIComponent(slug)}/episodes`, {
    cache: "no-store",
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to fetch episodes")
  }
  return res.json()
}

export type WatchlistStatus = "watching" | "planned" | "completed" | "on_hold" | "dropped"

export interface UserCollectionEntry {
  id: number
  user_id: number
  anime_id: number
  collection_type_id: number
  episodes_watched: number
  score: number
  created_at: string
  updated_at: string
  anime: Anime
  collection_type: {
    id: number
    name: string
  }
}

export async function addToMyCollection(params: {
  animeId: string
  status: WatchlistStatus
  token: string
}): Promise<void> {
  const res = await fetch(`${API_URL}/collections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ anime_id: Number(params.animeId), status: params.status }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to update collection")
  }
}

export async function removeFromMyCollection(params: {
  animeId: string
  token: string
}): Promise<void> {
  const res = await fetch(`${API_URL}/collections/${params.animeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to remove from collection")
  }
}

export async function getMyCollection(params: {
  token: string
}): Promise<UserCollectionEntry[]> {
  const res = await fetch(`${API_URL}/collections`, {
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to fetch collection")
  }

  return res.json()
}

export interface AdminMeta {
  genres: Genre[]
  studios: Studio[]
  statuses: Status[]
  sources: Source[]
  kinds: { id: number; name: string }[]
  ratings: { id: number; name: string }[]
}

export interface AdminUpsertEpisodeInput {
  group_id: number
  number: number
  duration?: number
}

export async function adminCreateEpisode(params: {
  token: string
  animeId: string
  input: AdminUpsertEpisodeInput
}): Promise<Episode> {
  const res = await fetch(`${API_URL}/admin/animes/${params.animeId}/episodes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify(params.input),
  })

  const raw = await res.text().catch(() => "")
  const data = raw ? (() => {
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  })() : null
  if (!res.ok) {
    throw new Error((data as any)?.error || raw || "Failed to create episode")
  }
  return data as Episode
}

export async function adminUpdateEpisode(params: {
  token: string
  episodeId: string
  input: AdminUpsertEpisodeInput
}): Promise<Episode> {
  const res = await fetch(`${API_URL}/admin/episodes/${params.episodeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify(params.input),
  })

  const raw = await res.text().catch(() => "")
  const data = raw ? (() => {
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  })() : null
  if (!res.ok) {
    throw new Error((data as any)?.error || raw || "Failed to update episode")
  }
  return data as Episode
}

export async function adminDeleteEpisode(params: {
  token: string
  episodeId: string
}): Promise<void> {
  const res = await fetch(`${API_URL}/admin/episodes/${params.episodeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to delete episode")
  }
}

// Video Source API Functions

export interface AdminUpsertVideoSourceInput {
  label: string
  type: "iframe" | "direct"
  url: string
  is_default?: boolean
  is_active?: boolean
  sort_order?: number
}

export async function adminCreateVideoSource(params: {
  token: string
  episodeId: string
  input: AdminUpsertVideoSourceInput
}): Promise<VideoSource> {
  const res = await fetch(`${API_URL}/admin/episodes/${params.episodeId}/sources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify(params.input),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || "Failed to create video source")
  }
  return data
}

export async function adminUpdateVideoSource(params: {
  token: string
  sourceId: string
  input: AdminUpsertVideoSourceInput
}): Promise<VideoSource> {
  const res = await fetch(`${API_URL}/admin/video-sources/${params.sourceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify(params.input),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || "Failed to update video source")
  }
  return data
}

export async function adminDeleteVideoSource(params: {
  token: string
  sourceId: string
}): Promise<void> {
  const res = await fetch(`${API_URL}/admin/video-sources/${params.sourceId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to delete video source")
  }
}

export async function adminSetDefaultVideoSource(params: {
  token: string
  sourceId: string
}): Promise<void> {
  const res = await fetch(`${API_URL}/admin/video-sources/${params.sourceId}/default`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to set default video source")
  }
}

export async function adminListVoiceGroups(params: { token: string }): Promise<VoiceGroup[]> {
  const res = await fetch(`${API_URL}/admin/voice-groups`, {
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to fetch voice groups")
  }

  return res.json()
}

export async function adminCreateVoiceGroup(params: {
  token: string
  input: { name: string; type: "dub" | "sub" }
}): Promise<VoiceGroup> {
  const res = await fetch(`${API_URL}/admin/voice-groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify(params.input),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || "Failed to create voice group")
  }
  return data
}

export async function adminUpdateVoiceGroup(params: {
  token: string
  id: string
  input: { name: string; type: "dub" | "sub" }
}): Promise<VoiceGroup> {
  const res = await fetch(`${API_URL}/admin/voice-groups/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify(params.input),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || "Failed to update voice group")
  }
  return data
}

export async function adminDeleteVoiceGroup(params: {
  token: string
  id: string
}): Promise<void> {
  const res = await fetch(`${API_URL}/admin/voice-groups/${params.id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to delete voice group")
  }
}

export async function getAnimeEpisodesFiltered(params: {
  idOrSlug: string
  group_id?: number
}): Promise<Episode[]> {
  const qs = new URLSearchParams()
  if (params.group_id) qs.set("group_id", String(params.group_id))
  const res = await fetch(`${API_URL}/animes/${encodeURIComponent(params.idOrSlug)}/episodes?${qs.toString()}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to fetch episodes")
  }
  return res.json()
}

export async function adminGetMeta(params: { token: string }): Promise<AdminMeta> {
  const res = await fetch(`${API_URL}/admin/meta`, {
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to fetch admin metadata")
  }

  return res.json()
}

export interface AdminCreateAnimeInput {
  url: string
  kind?: string
  duration?: number
  rating?: string
  trailer_url?: string
  score?: number
  episodes?: number
  poster_url?: string
  studio_id?: number | null
  status_id?: number | null
  source_id?: number | null
  genre_ids: number[]
  title_ru: string
  title_en_romaji: string
  description_ru?: string
  description_en?: string
}

export async function adminCreateAnime(params: {
  token: string
  input: AdminCreateAnimeInput
}): Promise<Anime> {
  const res = await fetch(`${API_URL}/admin/animes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify(params.input),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || "Failed to create anime")
  }

  return data
}

export async function adminUpdateAnime(params: {
  token: string
  id: string
  input: Omit<AdminCreateAnimeInput, "url">
}): Promise<Anime> {
  const res = await fetch(`${API_URL}/admin/animes/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify(params.input),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || "Failed to update anime")
  }

  return data
}

export async function adminDeleteAnime(params: {
  token: string
  id: string
}): Promise<void> {
  const res = await fetch(`${API_URL}/admin/animes/${params.id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to delete anime")
  }
}

export function getLocalizedTitle(anime: Anime, locale: string): string {
  if (!anime.translations) return anime.name
  const primary = anime.translations.find((t) => t.language.code === locale)
  if (primary?.title?.trim()) return primary.title
  const fallbackCode = locale === "ru" ? "en" : "ru"
  const fallback = anime.translations.find((t) => t.language.code === fallbackCode)
  if (fallback?.title?.trim()) return fallback.title
  return anime.name
}

export function getLocalizedDescription(anime: Anime, locale: string): string {
  if (!anime.translations) return ""
  const primary = anime.translations.find((t) => t.language.code === locale)
  if (primary?.description?.trim()) return primary.description
  const fallbackCode = locale === "ru" ? "en" : "ru"
  const fallback = anime.translations.find((t) => t.language.code === fallbackCode)
  return fallback?.description || ""
}

export function getLocalizedEpisodeName(episode: Episode | EpisodeItem, locale: string): string {
  return `Episode ${episode.number}`
}

export function getLocalizedEpisodeDescription(episode: Episode | EpisodeItem, locale: string): string {
  return ""
}

export function getAnimePosterUrl(anime: Anime): string {
  return anime.image_url || anime.image || ""
}

// Generic Metadata Admin Functions

async function adminListMetaItem<T>(token: string, path: string): Promise<T[]> {
  const res = await fetch(`${API_URL}/admin/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Failed to fetch ${path}`)
  return res.json()
}

async function adminCreateMetaItem<T>(token: string, path: string, name: string): Promise<T> {
  const res = await fetch(`${API_URL}/admin/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Failed to create ${path}`)
  return data
}

async function adminUpdateMetaItem<T>(token: string, path: string, id: number, name: string): Promise<T> {
  const res = await fetch(`${API_URL}/admin/${path}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Failed to update ${path}`)
  return data
}

async function adminDeleteMetaItem(token: string, path: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/admin/${path}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Failed to delete ${path}`)
  }
}

// Kinds
export const adminListKinds = (p: { token: string }) => adminListMetaItem<KindOption>(p.token, "kinds")
export const adminCreateKind = (p: { token: string; name: string }) => adminCreateMetaItem<KindOption>(p.token, "kinds", p.name)
export const adminUpdateKind = (p: { token: string; id: number; name: string }) => adminUpdateMetaItem<KindOption>(p.token, "kinds", p.id, p.name)
export const adminDeleteKind = (p: { token: string; id: number }) => adminDeleteMetaItem(p.token, "kinds", p.id)

// Ratings
export const adminListRatings = (p: { token: string }) => adminListMetaItem<RatingOption>(p.token, "ratings")
export const adminCreateRating = (p: { token: string; name: string }) => adminCreateMetaItem<RatingOption>(p.token, "ratings", p.name)
export const adminUpdateRating = (p: { token: string; id: number; name: string }) => adminUpdateMetaItem<RatingOption>(p.token, "ratings", p.id, p.name)
export const adminDeleteRating = (p: { token: string; id: number }) => adminDeleteMetaItem(p.token, "ratings", p.id)

// Statuses
export const adminListStatuses = (p: { token: string }) => adminListMetaItem<Status>(p.token, "statuses")
export const adminCreateStatus = (p: { token: string; name: string }) => adminCreateMetaItem<Status>(p.token, "statuses", p.name)
export const adminUpdateStatus = (p: { token: string; id: number; name: string }) => adminUpdateMetaItem<Status>(p.token, "statuses", p.id, p.name)
export const adminDeleteStatus = (p: { token: string; id: number }) => adminDeleteMetaItem(p.token, "statuses", p.id)

// Studios
export const adminListStudios = (p: { token: string }) => adminListMetaItem<Studio>(p.token, "studios")
export const adminCreateStudio = (p: { token: string; name: string }) => adminCreateMetaItem<Studio>(p.token, "studios", p.name)
export const adminUpdateStudio = (p: { token: string; id: number; name: string }) => adminUpdateMetaItem<Studio>(p.token, "studios", p.id, p.name)
export const adminDeleteStudio = (p: { token: string; id: number }) => adminDeleteMetaItem(p.token, "studios", p.id)

// Sources
export const adminListSources = (p: { token: string }) => adminListMetaItem<Source>(p.token, "sources")
export const adminCreateSource = (p: { token: string; name: string }) => adminCreateMetaItem<Source>(p.token, "sources", p.name)
export const adminUpdateSource = (p: { token: string; id: number; name: string }) => adminUpdateMetaItem<Source>(p.token, "sources", p.id, p.name)
export const adminDeleteSource = (p: { token: string; id: number }) => adminDeleteMetaItem(p.token, "sources", p.id)

// Genres
export const adminListGenres = (p: { token: string }) => adminListMetaItem<Genre>(p.token, "genres")
export const adminCreateGenre = (p: { token: string; name: string }) => adminCreateMetaItem<Genre>(p.token, "genres", p.name)
export const adminUpdateGenre = (p: { token: string; id: number; name: string }) => adminUpdateMetaItem<Genre>(p.token, "genres", p.id, p.name)
export const adminDeleteGenre = (p: { token: string; id: number }) => adminDeleteMetaItem(p.token, "genres", p.id)

export async function adminSetAnimeGenres(params: {
  token: string
  animeId: string
  genre_ids: number[]
}): Promise<Genre[]> {
  const res = await fetch(`${API_URL}/admin/animes/${params.animeId}/genres`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ genre_ids: params.genre_ids }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Failed to set genres")
  return data
}
