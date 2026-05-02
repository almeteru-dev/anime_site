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

type ApiErrorPayload = {
  error?: string
  error_code?: string
  ban_reason?: string
}

function maybeForceLogout(payload: ApiErrorPayload) {
  if (typeof window === "undefined") return
  const code = payload?.error_code
  if (code !== "BANNED" && code !== "REVOKED" && code !== "NOT_VERIFIED") return
  window.dispatchEvent(
    new CustomEvent("auth:force-logout", {
      detail: { error_code: code, ban_reason: payload?.ban_reason || "" },
    })
  )
}

export interface CatalogMeta {
  genres: Genre[]
  statuses: Status[]
  studios: Studio[]
  sources: Source[]
  ratings: RatingOption[]
  kinds: KindOption[]
  year_min: number
  year_max: number
}

export type GetAnimesParams = {
  q?: string
  genres?: string[]
  types?: string[]
  statuses?: string[]
  studios?: string[]
  sources?: string[]
  ratings?: string[]
  year_from?: number
  year_to?: number
  min_rating?: number
  release_unknown?: boolean
  complete_only?: boolean
  sort_by?: "score" | "studio" | "source" | "rating"
  sort_dir?: "asc" | "desc"
}

export type AdminUser = {
  id: number
  username: string
  email: string
  role: string
  is_verified: boolean
  is_banned: boolean
  ban_reason: string | null
  created_at: string
}

export type AdminListUsersResponse = {
  users: AdminUser[]
  total: number
}

export async function adminListUsers(params: {
  token: string
  q?: string
  role?: "all" | "user" | "moderator" | "admin" | "root"
  status?: "all" | "active" | "not_verified" | "banned"
  page?: number
  limit?: number
}): Promise<AdminListUsersResponse> {
  const qs = new URLSearchParams()
  if (params.q?.trim()) qs.set("q", params.q.trim())
  if (params.role && params.role !== "all") qs.set("role", params.role)
  if (params.status && params.status !== "all") qs.set("status", params.status)
  if (typeof params.page === "number") qs.set("page", String(params.page))
  if (typeof params.limit === "number") qs.set("limit", String(params.limit))

  const res = await fetch(`${API_URL}/admin/users?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${params.token}` },
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    maybeForceLogout(data)
    throw new Error(data.error || "Failed to fetch users")
  }
  return data
}

export async function adminGetUser(params: { token: string; id: string }): Promise<AdminUser> {
  const res = await fetch(`${API_URL}/admin/users/${params.id}`, {
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    maybeForceLogout(data)
    throw new Error(data.error || "Failed to fetch user")
  }
  return data
}

export async function adminUpdateUser(params: {
  token: string
  id: string
  input: { username?: string; email?: string; role?: "user" | "moderator" | "admin"; is_verified?: boolean }
}): Promise<AdminUser> {
  const res = await fetch(`${API_URL}/admin/users/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify(params.input),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    maybeForceLogout(data)
    throw new Error(data.error || "Failed to update user")
  }
  return data
}

export async function adminResetUserPasswordDefault(params: { token: string; id: string }): Promise<void> {
  const res = await fetch(`${API_URL}/admin/users/${params.id}/reset-password-default`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    maybeForceLogout(data)
    throw new Error(data.error || "Failed to reset password")
  }
}

export async function adminSetDefaultPassword(params: { token: string; password: string }): Promise<void> {
  const res = await fetch(`${API_URL}/admin/settings/default-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ password: params.password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    maybeForceLogout(data)
    throw new Error(data.error || "Failed to update default password")
  }
}

export async function adminCreateUser(params: {
  token: string
  input: { username: string; email: string; password: string; role: "user" | "moderator" | "admin" }
}): Promise<AdminUser> {
  const res = await fetch(`${API_URL}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify(params.input),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    maybeForceLogout(data)
    throw new Error(data.error || "Failed to create user")
  }
  return data
}

export async function adminTransferRoot(params: {
  token: string
  target_user_id: number
  password: string
}): Promise<{ message: string; force_logout?: boolean }> {
  const res = await fetch(`${API_URL}/admin/root/transfer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ target_user_id: params.target_user_id, password: params.password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    maybeForceLogout(data)
    throw new Error(data.error || "Failed to transfer root")
  }
  return data
}

export async function adminBanUser(params: {
  token: string
  id: string
  reason: string
}): Promise<AdminUser> {
  const res = await fetch(`${API_URL}/admin/users/${params.id}/ban`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ reason: params.reason }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    maybeForceLogout(data)
    throw new Error(data.error || "Failed to ban user")
  }
  return data
}

export async function adminUnbanUser(params: { token: string; id: string }): Promise<AdminUser> {
  const res = await fetch(`${API_URL}/admin/users/${params.id}/unban`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    maybeForceLogout(data)
    throw new Error(data.error || "Failed to unban user")
  }
  return data
}

export async function adminDeleteUser(params: { token: string; id: string }): Promise<void> {
  const res = await fetch(`${API_URL}/admin/users/${params.id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    maybeForceLogout(data)
    throw new Error(data.error || "Failed to delete user")
  }
}

export async function getCatalogMeta(): Promise<CatalogMeta> {
  const res = await fetch(`${API_URL}/catalog/meta`, {
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error("Failed to fetch catalog meta")
  }
  return res.json()
}

export async function getAnimes(params?: GetAnimesParams): Promise<Anime[]> {
  const sp = new URLSearchParams()
  if (params?.q) sp.set("q", params.q)
  if (params?.genres?.length) sp.set("genres", params.genres.join(","))
  if (params?.types?.length) sp.set("types", params.types.join(","))
  if (params?.statuses?.length) sp.set("statuses", params.statuses.join(","))
  if (params?.studios?.length) sp.set("studios", params.studios.join(","))
  if (params?.sources?.length) sp.set("sources", params.sources.join(","))
  if (params?.ratings?.length) sp.set("ratings", params.ratings.join(","))
  if (typeof params?.year_from === "number") sp.set("year_from", String(params.year_from))
  if (typeof params?.year_to === "number") sp.set("year_to", String(params.year_to))
  if (typeof params?.min_rating === "number") sp.set("min_rating", String(params.min_rating))
  if (params?.release_unknown) sp.set("release_unknown", "1")
  if (params?.complete_only) sp.set("complete_only", "1")
  if (params?.sort_by) sp.set("sort_by", params.sort_by)
  if (params?.sort_dir) sp.set("sort_dir", params.sort_dir)

  const url = sp.size ? `${API_URL}/animes?${sp.toString()}` : `${API_URL}/animes`
  const res = await fetch(url, {
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error("Failed to fetch animes")
  }
  return res.json()
}

// Auth API Functions

export async function verifyEmailToken(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/verify-email?token=${encodeURIComponent(token)}`)
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Verification failed")
  }
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to resend verification")
  }
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to send reset link")
  }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to reset password")
  }
}

export async function updateAge(params: { token: string; age: number }): Promise<void> {
  const res = await fetch(`${API_URL}/me/age`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ age: params.age }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    maybeForceLogout(data)
    throw new Error(data.error || "Failed to update age")
  }
}

export async function updatePassword(params: { 
  token: string; 
  current_password: string; 
  new_password: string 
}): Promise<void> {
  const res = await fetch(`${API_URL}/me/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ 
      current_password: params.current_password, 
      new_password: params.new_password 
    }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    maybeForceLogout(data)
    throw new Error(data.error || "Failed to update password")
  }
}

export async function requestOldEmailCode(params: { token: string; email: string }): Promise<void> {
  const res = await fetch(`${API_URL}/me/email/request-old`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ email: params.email }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    maybeForceLogout(data)
    throw new Error(data.error || "Failed to request code")
  }
}

export async function verifyOldEmailCode(params: { token: string; code: string }): Promise<void> {
  const res = await fetch(`${API_URL}/me/email/verify-old`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ code: params.code }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    maybeForceLogout(data)
    throw new Error(data.error || "Invalid code")
  }
}

export async function requestNewEmailCode(params: { token: string; email: string }): Promise<void> {
  const res = await fetch(`${API_URL}/me/email/request-new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ email: params.email }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    maybeForceLogout(data)
    throw new Error(data.error || "Failed to request code")
  }
}

export async function verifyNewEmailCode(params: { token: string; code: string }): Promise<void> {
  const res = await fetch(`${API_URL}/me/email/verify-new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ code: params.code }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    maybeForceLogout(data)
    throw new Error(data.error || "Invalid code")
  }
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

export interface User {
  id: number
  username: string
  email: string
  avatar_url?: string
  age?: number
  role: string
  created_at: string
}

export async function getMe(params: { token: string }): Promise<User> {
  const res = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    maybeForceLogout(data)
    throw new Error(data.error || "Failed to fetch user profile")
  }

  return res.json()
}

export type WatchlistStatus = "watching" | "planned" | "completed" | "on_hold" | "dropped"

export type UserListStatus = WatchlistStatus

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
    maybeForceLogout(data)
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
    maybeForceLogout(data)
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
    maybeForceLogout(data)
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
    if (data && typeof data === "object") maybeForceLogout(data as any)
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
    if (data && typeof data === "object") maybeForceLogout(data as any)
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
    maybeForceLogout(data)
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
    maybeForceLogout(data)
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
    maybeForceLogout(data)
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
    maybeForceLogout(data)
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
    maybeForceLogout(data)
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
    maybeForceLogout(data)
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
    maybeForceLogout(data)
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
    maybeForceLogout(data)
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
    maybeForceLogout(data)
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
    maybeForceLogout(data)
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
  aired_on?: string
  released_on?: string
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
    maybeForceLogout(data)
    const err: any = new Error(data.error || "Failed to create anime")
    err.payload = data
    throw err
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
    maybeForceLogout(data)
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
    maybeForceLogout(data)
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
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    maybeForceLogout(data)
    throw new Error((data as any).error || `Failed to fetch ${path}`)
  }
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
  if (!res.ok) {
    maybeForceLogout(data)
    throw new Error(data.error || `Failed to create ${path}`)
  }
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
  if (!res.ok) {
    maybeForceLogout(data)
    throw new Error(data.error || `Failed to update ${path}`)
  }
  return data
}

async function adminDeleteMetaItem(token: string, path: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/admin/${path}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    maybeForceLogout(data)
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
  if (!res.ok) {
    maybeForceLogout(data)
    throw new Error(data.error || "Failed to set genres")
  }
  return data
}
