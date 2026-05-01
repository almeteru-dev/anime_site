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

export interface Episode {
  id: number
  anime_id: number
  server_number: number
  group_id: number
  number: number
  video_url: string
  duration: number
  created_at: string
  voice_group: VoiceGroup
}

export interface EpisodeItem {
  id: number
  number: number
  video_url: string
  duration: number
  group_id: number
  server_number: number
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
  kinds: KindOption[]
  ratings: RatingOption[]
}

export interface KindOption {
  id: number
  name: string
}

export interface RatingOption {
  id: number
  name: string
}

export async function adminListKinds(params: { token: string }): Promise<KindOption[]> {
  const res = await fetch(`${API_URL}/admin/kinds`, {
    headers: { Authorization: `Bearer ${params.token}` },
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to fetch kinds")
  return data
}

export async function adminCreateKind(params: { token: string; name: string }): Promise<KindOption> {
  const res = await fetch(`${API_URL}/admin/kinds`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ name: params.name }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to create kind")
  return data
}

export async function adminUpdateKind(params: { token: string; id: number; name: string }): Promise<KindOption> {
  const res = await fetch(`${API_URL}/admin/kinds/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ name: params.name }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to update kind")
  return data
}

export async function adminDeleteKind(params: { token: string; id: number }): Promise<void> {
  const res = await fetch(`${API_URL}/admin/kinds/${params.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${params.token}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to delete kind")
}

export async function adminListRatings(params: { token: string }): Promise<RatingOption[]> {
  const res = await fetch(`${API_URL}/admin/ratings`, {
    headers: { Authorization: `Bearer ${params.token}` },
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to fetch ratings")
  return data
}

export async function adminCreateRating(params: { token: string; name: string }): Promise<RatingOption> {
  const res = await fetch(`${API_URL}/admin/ratings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ name: params.name }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to create rating")
  return data
}

export async function adminUpdateRating(params: { token: string; id: number; name: string }): Promise<RatingOption> {
  const res = await fetch(`${API_URL}/admin/ratings/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ name: params.name }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to update rating")
  return data
}

export async function adminDeleteRating(params: { token: string; id: number }): Promise<void> {
  const res = await fetch(`${API_URL}/admin/ratings/${params.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${params.token}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to delete rating")
}

export async function adminListStatuses(params: { token: string }): Promise<Status[]> {
  const res = await fetch(`${API_URL}/admin/statuses`, {
    headers: { Authorization: `Bearer ${params.token}` },
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to fetch statuses")
  return data
}

export async function adminCreateStatus(params: { token: string; name: string }): Promise<Status> {
  const res = await fetch(`${API_URL}/admin/statuses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ name: params.name }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to create status")
  return data
}

export async function adminUpdateStatus(params: { token: string; id: number; name: string }): Promise<Status> {
  const res = await fetch(`${API_URL}/admin/statuses/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ name: params.name }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to update status")
  return data
}

export async function adminDeleteStatus(params: { token: string; id: number }): Promise<void> {
  const res = await fetch(`${API_URL}/admin/statuses/${params.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${params.token}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to delete status")
}

export async function adminListStudios(params: { token: string }): Promise<Studio[]> {
  const res = await fetch(`${API_URL}/admin/studios`, {
    headers: { Authorization: `Bearer ${params.token}` },
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to fetch studios")
  return data
}

export async function adminCreateStudio(params: { token: string; name: string }): Promise<Studio> {
  const res = await fetch(`${API_URL}/admin/studios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ name: params.name }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to create studio")
  return data
}

export async function adminUpdateStudio(params: { token: string; id: number; name: string }): Promise<Studio> {
  const res = await fetch(`${API_URL}/admin/studios/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ name: params.name }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to update studio")
  return data
}

export async function adminDeleteStudio(params: { token: string; id: number }): Promise<void> {
  const res = await fetch(`${API_URL}/admin/studios/${params.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${params.token}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to delete studio")
}

export async function adminListSources(params: { token: string }): Promise<Source[]> {
  const res = await fetch(`${API_URL}/admin/sources`, {
    headers: { Authorization: `Bearer ${params.token}` },
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to fetch sources")
  return data
}

export async function adminCreateSource(params: { token: string; name: string }): Promise<Source> {
  const res = await fetch(`${API_URL}/admin/sources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ name: params.name }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to create source")
  return data
}

export async function adminUpdateSource(params: { token: string; id: number; name: string }): Promise<Source> {
  const res = await fetch(`${API_URL}/admin/sources/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ name: params.name }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to update source")
  return data
}

export async function adminDeleteSource(params: { token: string; id: number }): Promise<void> {
  const res = await fetch(`${API_URL}/admin/sources/${params.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${params.token}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to delete source")
}

export async function adminListGenres(params: { token: string }): Promise<Genre[]> {
  const res = await fetch(`${API_URL}/admin/genres`, {
    headers: { Authorization: `Bearer ${params.token}` },
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to fetch genres")
  return data
}

export async function adminCreateGenre(params: { token: string; name: string }): Promise<Genre> {
  const res = await fetch(`${API_URL}/admin/genres`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ name: params.name }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to create genre")
  return data
}

export async function adminUpdateGenre(params: { token: string; id: number; name: string }): Promise<Genre> {
  const res = await fetch(`${API_URL}/admin/genres/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ name: params.name }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to update genre")
  return data
}

export async function adminDeleteGenre(params: { token: string; id: number }): Promise<void> {
  const res = await fetch(`${API_URL}/admin/genres/${params.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${params.token}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to delete genre")
}

export async function adminSetAnimeGenres(params: { token: string; animeId: string; genre_ids: number[] }): Promise<Genre[]> {
  const res = await fetch(`${API_URL}/admin/animes/${params.animeId}/genres`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ genre_ids: params.genre_ids }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).error || "Failed to update anime genres")
  return (data as any).genres || []
}

export interface AdminUpsertEpisodeInput {
  server_number: number
  group_id: number
  number: number
  video_url: string
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
  server_number?: number
  group_id?: number
}): Promise<Episode[]> {
  const qs = new URLSearchParams()
  if (params.server_number) qs.set("server_number", String(params.server_number))
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
  episodes_aired?: number
  aired_on?: string | null
  released_on?: string | null
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

export function getLocalizedEpisodeName(episode: Episode, locale: string): string {
  return `Episode ${episode.number}`
}

export function getLocalizedEpisodeDescription(episode: Episode, locale: string): string {
  return ""
}

export function getAnimePosterUrl(anime: Anime): string {
  return anime.image_url || anime.image || ""
}
