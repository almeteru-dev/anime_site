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

export type WatchlistStatus = "watching" | "planned" | "completed"

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
  const translation = anime.translations.find((t) => t.language.code === locale)
  return translation ? translation.title : anime.name
}

export function getLocalizedDescription(anime: Anime, locale: string): string {
  if (!anime.translations) return ""
  const translation = anime.translations.find((t) => t.language.code === locale)
  return translation ? translation.description : ""
}

export function getAnimePosterUrl(anime: Anime): string {
  return anime.image_url || anime.image || ""
}
