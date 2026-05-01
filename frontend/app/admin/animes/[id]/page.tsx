"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  adminGetMeta,
  adminCreateEpisode,
  adminDeleteEpisode,
  adminUpdateEpisode,
  adminListVoiceGroups,
  adminCreateVoiceGroup,
  adminUpdateVoiceGroup,
  adminDeleteVoiceGroup,
  adminUpdateAnime,
  getAnimeByID,
  getAnimeEpisodesFiltered,
  type AdminUpsertEpisodeInput,
  type AdminMeta,
  type Anime,
  type Episode,
  type VoiceGroup,
} from "@/lib/api"
import { cn } from "@/lib/utils"
import { slugify } from "@/lib/slug"

function pickTranslation(anime: Anime, code: "ru" | "en") {
  return anime.translations?.find((t) => t.language.code === code)
}

export default function AdminEditAnimePage() {
  const params = useParams<{ id: string }>()
  const { token } = useAuth()
  const [meta, setMeta] = useState<AdminMeta | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [genresMode, setGenresMode] = useState<"grid" | "list">("grid")
  const [genreQuery, setGenreQuery] = useState("")

  const [episodes, setEpisodes] = useState<Episode[] | null>(null)
  const [episodeError, setEpisodeError] = useState<string | null>(null)
  const [episodeSaving, setEpisodeSaving] = useState(false)
  const [editingEpisodeId, setEditingEpisodeId] = useState<number | null>(null)
  const [voiceGroups, setVoiceGroups] = useState<VoiceGroup[] | null>(null)
  const [episodesTab, setEpisodesTab] = useState<"voice_groups" | "episodes">("episodes")
  const [existingGroupsFilter, setExistingGroupsFilter] = useState<"all" | "dub" | "sub">("all")
  const [selectedServerNumber, setSelectedServerNumber] = useState<number>(1)
  const [selectedGroupType, setSelectedGroupType] = useState<"dub" | "sub">("dub")
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [newGroupName, setNewGroupName] = useState("")

  const [voiceGroupForm, setVoiceGroupForm] = useState<{ name: string; type: "dub" | "sub" }>({
    name: "",
    type: "dub",
  })
  const [editingVoiceGroupId, setEditingVoiceGroupId] = useState<number | null>(null)
  const [episodeForm, setEpisodeForm] = useState<AdminUpsertEpisodeInput>({
    server_number: 1,
    group_id: 0,
    number: 1,
    video_url: "",
    duration: 24,
  })

  const [form, setForm] = useState({
    title_ru: "",
    title_en_romaji: "",
    description_ru: "",
    description_en: "",
    poster_url: "",
    trailer_url: "",
    status_id: null as number | null,
    studio_id: null as number | null,
    source_id: null as number | null,
    genre_ids: [] as number[],
    kind: "tv",
    episodes_aired: 0,
    aired_on: "" as string,
    released_on: "" as string,
    episodes: 12,
    duration: 24,
    rating: "",
    score: 0,
  })

  const toDateInput = (value: any) => {
    if (!value) return ""
    const s = String(value)
    return s.length >= 10 ? s.slice(0, 10) : s
  }

  const slug = useMemo(() => slugify(form.title_en_romaji), [form.title_en_romaji])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!token) return
      try {
        const [m, a] = await Promise.all([adminGetMeta({ token }), getAnimeByID(params.id)])
        if (!mounted) return
        setMeta(m)

        const ru = pickTranslation(a, "ru")
        const en = pickTranslation(a, "en")
        setForm({
          title_ru: ru?.title || "",
          title_en_romaji: en?.title || a.name,
          description_ru: ru?.description || "",
          description_en: en?.description || "",
          poster_url: a.image_url || a.image || "",
          trailer_url: a.trailer_url || "",
          status_id: a.status_id ?? null,
          studio_id: a.studio_id ?? null,
          source_id: a.source_id ?? null,
          genre_ids: (a.genres || []).map((g) => g.id),
          kind: a.kind || "tv",
          episodes_aired: a.episodes_aired || 0,
          aired_on: toDateInput(a.aired_on),
          released_on: toDateInput(a.released_on),
          episodes: a.episodes || 0,
          duration: a.duration || 0,
          rating: a.rating || "",
          score: a.score || 0,
        })
      } catch (e: any) {
        if (mounted) setError(e.message || "Failed to load")
      }
    })()
    return () => {
      mounted = false
    }
  }, [params.id, token])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!token) return
      try {
        const groups = await adminListVoiceGroups({ token })
        if (mounted) setVoiceGroups(groups)
      } catch (e: any) {
        if (mounted) setEpisodeError(e.message || "Failed to load voice groups")
      }
    })()
    return () => {
      mounted = false
    }
  }, [token])

  const dubVoiceGroups = useMemo(() => {
    return (voiceGroups || []).filter((g) => g.type === "dub")
  }, [voiceGroups])

  const subVoiceGroups = useMemo(() => {
    return (voiceGroups || []).filter((g) => g.type === "sub")
  }, [voiceGroups])

  const groupsForType = useMemo(() => {
    return (voiceGroups || []).filter((g) => g.type === selectedGroupType)
  }, [selectedGroupType, voiceGroups])

  useEffect(() => {
    if (!voiceGroups) return

    const current = voiceGroups.find((g) => g.id === selectedGroupId)
    if (current && current.type === selectedGroupType) return

    const preferred = voiceGroups.find((g) => g.type === selectedGroupType) || voiceGroups[0]
    if (preferred) {
      setSelectedGroupType(preferred.type)
      setSelectedGroupId(preferred.id)
      setEpisodeForm((p) => ({ ...p, group_id: preferred.id }))
    } else {
      setSelectedGroupId(null)
      setEpisodeForm((p) => ({ ...p, group_id: 0 }))
    }
  }, [selectedGroupId, selectedGroupType, voiceGroups])

  useEffect(() => {
    setEpisodeForm((p) => ({ ...p, server_number: selectedServerNumber }))
  }, [selectedServerNumber])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        if (!selectedGroupId) {
          if (mounted) setEpisodes([])
          return
        }
        const data = await getAnimeEpisodesFiltered({
          idOrSlug: params.id,
          server_number: selectedServerNumber,
          group_id: selectedGroupId,
        })
        if (mounted) setEpisodes(data)
      } catch (e: any) {
        if (mounted) setEpisodeError(e.message || "Failed to load episodes")
      }
    })()
    return () => {
      mounted = false
    }
  }, [params.id, selectedGroupId, selectedServerNumber])

  const resetEpisodeForm = () => {
    setEditingEpisodeId(null)
    setEpisodeForm({
      server_number: selectedServerNumber,
      group_id: selectedGroupId || 0,
      number: 1,
      video_url: "",
      duration: 24,
    })
  }

  const startEditEpisode = (ep: Episode) => {
    setSelectedServerNumber(ep.server_number)
    if (ep.voice_group?.type) setSelectedGroupType(ep.voice_group.type)
    setSelectedGroupId(ep.group_id)
    setEditingEpisodeId(ep.id)
    setEpisodeForm({
      server_number: ep.server_number,
      group_id: ep.group_id,
      number: ep.number,
      video_url: ep.video_url,
      duration: ep.duration || 0,
    })
  }

  const quickAddGroup = async () => {
    if (!token) return
    const name = newGroupName.trim()
    if (!name) return
    setEpisodeSaving(true)
    setEpisodeError(null)
    try {
      const created = await adminCreateVoiceGroup({
        token,
        input: { name, type: selectedGroupType },
      })
      setVoiceGroups((prev) => ([...(prev || []), created].sort((a, b) => a.name.localeCompare(b.name))))
      setSelectedGroupId(created.id)
      setEpisodeForm((p) => ({ ...p, group_id: created.id }))
      setNewGroupName("")
    } catch (e: any) {
      setEpisodeError(e.message || "Failed to create voice group")
    } finally {
      setEpisodeSaving(false)
    }
  }

  const saveVoiceGroup = async () => {
    if (!token) return
    const name = voiceGroupForm.name.trim()
    if (!name) return

    setEpisodeSaving(true)
    setEpisodeError(null)
    try {
      if (editingVoiceGroupId) {
        const updated = await adminUpdateVoiceGroup({
          token,
          id: String(editingVoiceGroupId),
          input: { name, type: voiceGroupForm.type },
        })
        setVoiceGroups((prev) => (prev ? prev.map((g) => (g.id === updated.id ? updated : g)).sort((a, b) => a.name.localeCompare(b.name)) : prev))
      } else {
        const created = await adminCreateVoiceGroup({
          token,
          input: { name, type: voiceGroupForm.type },
        })
        setVoiceGroups((prev) => ([...(prev || []), created].sort((a, b) => a.name.localeCompare(b.name))))
      }
      setVoiceGroupForm({ name: "", type: voiceGroupForm.type })
      setEditingVoiceGroupId(null)
    } catch (e: any) {
      setEpisodeError(e.message || "Failed to save voice group")
    } finally {
      setEpisodeSaving(false)
    }
  }

  const startEditVoiceGroup = (g: VoiceGroup) => {
    setEpisodesTab("voice_groups")
    setEditingVoiceGroupId(g.id)
    setVoiceGroupForm({ name: g.name, type: g.type })
  }

  const deleteVoiceGroup = async (g: VoiceGroup) => {
    if (!token) return
    const ok = window.confirm(`Delete voice group "${g.name}"? This will also delete related episodes.`)
    if (!ok) return

    setEpisodeSaving(true)
    setEpisodeError(null)
    try {
      await adminDeleteVoiceGroup({ token, id: String(g.id) })
      setVoiceGroups((prev) => (prev ? prev.filter((x) => x.id !== g.id) : prev))
      if (selectedGroupId === g.id) {
        setSelectedGroupId(null)
        setEpisodeForm((p) => ({ ...p, group_id: 0 }))
      }
      setEditingVoiceGroupId((prev) => (prev === g.id ? null : prev))
    } catch (e: any) {
      setEpisodeError(e.message || "Failed to delete voice group")
    } finally {
      setEpisodeSaving(false)
    }
  }

  const saveEpisode = async () => {
    if (!token) return
    if (!selectedGroupId) {
      setEpisodeError("Select a voice group first")
      return
    }
    if (form.episodes <= 0) {
      setEpisodeError("Set total episodes on the anime first")
      return
    }
    if (episodeForm.number > form.episodes) {
      setEpisodeError("Episode number exceeds total episodes")
      return
    }

    const input: AdminUpsertEpisodeInput = {
      ...episodeForm,
      server_number: selectedServerNumber,
      group_id: selectedGroupId,
    }

    setEpisodeSaving(true)
    setEpisodeError(null)
    try {
      if (editingEpisodeId) {
        const updated = await adminUpdateEpisode({
          token,
          episodeId: String(editingEpisodeId),
          input,
        })
        setEpisodes((prev) => (prev ? prev.map((e) => (e.id === updated.id ? updated : e)).sort((a, b) => a.number - b.number) : prev))
      } else {
        const created = await adminCreateEpisode({
          token,
          animeId: params.id,
          input,
        })
        setEpisodes((prev) => ([...(prev || []), created].sort((a, b) => a.number - b.number)))
      }
      resetEpisodeForm()
    } catch (e: any) {
      const msg = typeof e === "string" ? e : e?.message
      if (msg === "Anime not found") {
        setEpisodeError("Anime not found (try reloading this page)")
        return
      }
      if (msg === "Admin access required" || msg === "Invalid or expired token") {
        setEpisodeError("Authorization error (log out and log in again)")
        return
      }
      setEpisodeError(msg || "Failed to save episode")
    } finally {
      setEpisodeSaving(false)
    }
  }

  const deleteEpisode = async (ep: Episode) => {
    if (!token) return
    const ok = window.confirm(`Delete episode ${ep.number}?`)
    if (!ok) return
    setEpisodeSaving(true)
    setEpisodeError(null)
    try {
      await adminDeleteEpisode({ token, episodeId: String(ep.id) })
      setEpisodes((prev) => (prev ? prev.filter((x) => x.id !== ep.id) : prev))
      if (editingEpisodeId === ep.id) resetEpisodeForm()
    } catch (e: any) {
      setEpisodeError(e.message || "Failed to delete episode")
    } finally {
      setEpisodeSaving(false)
    }
  }

  const canSubmit = useMemo(() => {
    return !!form.title_ru.trim() && !!form.title_en_romaji.trim() && !!slug
  }, [form.title_en_romaji, form.title_ru, slug])

  const allGenres = meta?.genres || []

  const filteredGenres = useMemo(() => {
    const q = genreQuery.trim().toLowerCase()
    if (!q) return allGenres
    return allGenres.filter((g) => g.name.toLowerCase().includes(q))
  }, [allGenres, genreQuery])

  const selectedGenres = useMemo(() => {
    const selected = new Set(form.genre_ids)
    return allGenres.filter((g) => selected.has(g.id))
  }, [allGenres, form.genre_ids])

  const toggleGenre = (id: number) => {
    setForm((prev) => {
      const has = prev.genre_ids.includes(id)
      return {
        ...prev,
        genre_ids: has ? prev.genre_ids.filter((x) => x !== id) : [...prev.genre_ids, id],
      }
    })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    if (!canSubmit) return

    setIsLoading(true)
    setError(null)
    try {
      await adminUpdateAnime({
        token,
        id: params.id,
        input: {
          kind: form.kind,
          duration: form.duration,
          rating: form.rating,
          episodes_aired: form.episodes_aired,
          aired_on: form.aired_on || null,
          released_on: form.released_on || null,
          trailer_url: form.trailer_url,
          score: form.score,
          episodes: form.episodes,
          poster_url: form.poster_url,
          studio_id: form.studio_id,
          status_id: form.status_id,
          source_id: form.source_id,
          genre_ids: form.genre_ids,
          title_ru: form.title_ru,
          title_en_romaji: form.title_en_romaji,
          description_ru: form.description_ru,
          description_en: form.description_en,
        },
      })
      window.location.href = "/admin/animes"
    } catch (e: any) {
      setError(e.message || "Failed to save")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Anime</h1>
          <p className="text-sm text-foreground-muted">Update fields and translations (RU + Romaji)</p>
        </div>
        <Link
          href="/admin/animes"
          className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm font-semibold text-foreground-muted hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </Link>
      </div>

      <form onSubmit={submit} className="mt-6">
        <div className="rounded-2xl border border-border/60 bg-background-secondary/40 p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Slug (URL)</label>
              <input
                value={slug}
                readOnly
                className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50 opacity-80"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Poster URL</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <input
                  value={form.poster_url || ""}
                  onChange={(e) => setForm((p) => ({ ...p, poster_url: e.target.value }))}
                  placeholder="https://cdn.myanimelist.net/...jpg"
                  className="w-full h-11 rounded-xl bg-background border border-border/60 pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-semibold text-foreground-muted">Trailer URL (optional)</label>
              <input
                value={form.trailer_url || ""}
                onChange={(e) => setForm((p) => ({ ...p, trailer_url: e.target.value }))}
                placeholder="https://www.youtube.com/embed/... or direct video url"
                className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Title (RU)</label>
              <input
                value={form.title_ru}
                onChange={(e) => setForm((p) => ({ ...p, title_ru: e.target.value }))}
                className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Title (Romaji)</label>
              <input
                value={form.title_en_romaji}
                onChange={(e) => setForm((p) => ({ ...p, title_en_romaji: e.target.value }))}
                className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-semibold text-foreground-muted">Description (RU)</label>
              <textarea
                value={form.description_ru || ""}
                onChange={(e) => setForm((p) => ({ ...p, description_ru: e.target.value }))}
                rows={8}
                className="w-full rounded-2xl bg-primary/5 border border-primary/30 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/60"
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-semibold text-foreground-muted">Description (Romaji)</label>
              <textarea
                value={form.description_en || ""}
                onChange={(e) => setForm((p) => ({ ...p, description_en: e.target.value }))}
                rows={8}
                className="w-full rounded-2xl bg-primary/5 border border-primary/30 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/60"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Status</label>
              <select
                value={form.status_id ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, status_id: e.target.value ? Number(e.target.value) : null }))}
                className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
              >
                <option value="">Select…</option>
                {meta?.statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Studio</label>
              <select
                value={form.studio_id ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, studio_id: e.target.value ? Number(e.target.value) : null }))}
                className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
              >
                <option value="">Select…</option>
                {meta?.studios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Source</label>
              <select
                value={form.source_id ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, source_id: e.target.value ? Number(e.target.value) : null }))}
                className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
              >
                <option value="">Select…</option>
                {meta?.sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Episodes</label>
              <input
                type="number"
                min={0}
                value={form.episodes ?? 0}
                onChange={(e) => setForm((p) => ({ ...p, episodes: Number(e.target.value) }))}
                className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Episodes aired</label>
              <input
                type="number"
                min={0}
                value={form.episodes_aired ?? 0}
                onChange={(e) => setForm((p) => ({ ...p, episodes_aired: Number(e.target.value) }))}
                className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Duration (min)</label>
              <input
                type="number"
                min={0}
                value={form.duration ?? 0}
                onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))}
                className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Aired on</label>
              <input
                type="date"
                value={form.aired_on || ""}
                onChange={(e) => setForm((p) => ({ ...p, aired_on: e.target.value }))}
                className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Released on</label>
              <input
                type="date"
                value={form.released_on || ""}
                onChange={(e) => setForm((p) => ({ ...p, released_on: e.target.value }))}
                className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Kind</label>
              <select
                value={form.kind || ""}
                onChange={(e) => setForm((p) => ({ ...p, kind: e.target.value }))}
                className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
              >
                <option value="">Select…</option>
                {[...(meta?.kinds || []), ...(form.kind && !(meta?.kinds || []).some((k) => k.name === form.kind) ? [{ id: -1, name: form.kind }] : [])].map((k) => (
                  <option key={k.id} value={k.name}>
                    {k.name}
                  </option>
                ))}
              </select>
              <Link href="/admin/kinds-ratings" target="_blank" className="text-xs text-primary hover:underline">
                Manage kinds
              </Link>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Rating</label>
              <select
                value={form.rating || ""}
                onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))}
                className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
              >
                <option value="">Select…</option>
                {[...(meta?.ratings || []), ...(form.rating && !(meta?.ratings || []).some((r) => r.name === form.rating) ? [{ id: -1, name: form.rating }] : [])].map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
              <Link href="/admin/kinds-ratings" target="_blank" className="text-xs text-primary hover:underline">
                Manage ratings
              </Link>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-semibold text-foreground-muted">Genres</label>
              <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background p-1">
                {([
                  { key: "grid" as const, label: "Grid" },
                  { key: "list" as const, label: "List" },
                ] as const).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setGenresMode(t.key)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                      genresMode === t.key
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground-muted hover:text-foreground hover:bg-background-tertiary/30"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {genresMode === "grid" ? (
                <div className="rounded-xl border border-border/60 bg-background p-3 max-h-48 overflow-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {allGenres.map((g) => {
                      const active = form.genre_ids.includes(g.id)
                      return (
                        <button
                          type="button"
                          key={g.id}
                          onClick={() => toggleGenre(g.id)}
                          className={cn(
                            "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm border transition-colors",
                            active
                              ? "border-primary/40 bg-primary/10 text-foreground"
                              : "border-border/60 bg-background text-foreground-muted hover:text-foreground hover:bg-background-tertiary/30"
                          )}
                        >
                          <span className="truncate">{g.name}</span>
                          <span className={cn("text-xs", active ? "text-primary" : "text-foreground-subtle")}>#{g.id}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border/60 bg-background p-3">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <input
                        value={genreQuery}
                        onChange={(e) => setGenreQuery(e.target.value)}
                        placeholder="Search genres…"
                        className="w-full h-10 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
                      />
                      <div className="rounded-xl border border-border/60 bg-background-secondary/20 max-h-56 overflow-auto p-2">
                        <div className="space-y-1">
                          {filteredGenres.map((g) => {
                            const active = form.genre_ids.includes(g.id)
                            return (
                              <button
                                key={g.id}
                                type="button"
                                onClick={() => toggleGenre(g.id)}
                                className={cn(
                                  "w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm border transition-colors",
                                  active
                                    ? "border-primary/40 bg-primary/10 text-foreground"
                                    : "border-border/60 bg-background text-foreground-muted hover:text-foreground hover:bg-background-tertiary/30"
                                )}
                              >
                                <span className="truncate">{g.name}</span>
                                <span className={cn("text-xs", active ? "text-primary" : "text-foreground-subtle")}>#{g.id}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-foreground-muted">Selected</div>
                      <div className="rounded-xl border border-border/60 bg-background-secondary/20 min-h-14 p-3">
                        {selectedGenres.length === 0 ? (
                          <div className="text-sm text-foreground-muted">No genres selected.</div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {selectedGenres.map((g) => (
                              <button
                                key={g.id}
                                type="button"
                                onClick={() => toggleGenre(g.id)}
                                className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground hover:bg-background-tertiary/30"
                              >
                                <span>{g.name}</span>
                                <span className="text-xs text-red-400">Remove</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
            <Link
              href="/admin/animes"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-border/60 bg-background px-5 py-2.5 text-sm font-semibold text-foreground-muted hover:text-foreground"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit || isLoading}
              className={cn(
                "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold",
                !canSubmit || isLoading
                  ? "bg-primary/40 text-primary-foreground/70 cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8 rounded-2xl border border-border/60 bg-background-secondary/40 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Episodes</h2>
            <p className="text-sm text-foreground-muted">Select server and voice group, then add or edit episodes</p>
          </div>
          {editingEpisodeId && (
            <button
              type="button"
              onClick={resetEpisodeForm}
              className="rounded-xl border border-border/60 bg-background px-4 py-2 text-sm font-semibold text-foreground-muted hover:text-foreground"
            >
              Cancel edit
            </button>
          )}
        </div>

        {episodeError && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {episodeError}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/60 bg-background p-1">
          {([
            { key: "voice_groups" as const, label: "Voice Groups" },
            { key: "episodes" as const, label: "Episode Manager" },
          ] as const).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setEpisodesTab(t.key)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                episodesTab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground-muted hover:text-foreground hover:bg-background-tertiary/30"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {episodesTab === "voice_groups" ? (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border/60 bg-background p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">{editingVoiceGroupId ? "Edit Voice Group" : "Add Voice Group"}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground-muted">Name</label>
                  <input
                    value={voiceGroupForm.name}
                    onChange={(e) => setVoiceGroupForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder={voiceGroupForm.type === "dub" ? "e.g., Anidub" : "e.g., Crunchyroll"}
                    className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <div className="text-xs font-semibold text-foreground-muted">Type</div>
                  <div className="flex items-center gap-2">
                    {([
                      { key: "dub" as const, label: "Dubbed" },
                      { key: "sub" as const, label: "Subbed" },
                    ] as const).map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setVoiceGroupForm((p) => ({ ...p, type: t.key }))}
                        className={cn(
                          "rounded-xl border px-4 py-2 text-sm font-semibold transition-colors",
                          voiceGroupForm.type === t.key
                            ? "border-primary/40 bg-primary/10 text-foreground"
                            : "border-border/60 bg-background text-foreground-muted hover:text-foreground hover:bg-background-tertiary/30"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                {editingVoiceGroupId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVoiceGroupId(null)
                      setVoiceGroupForm({ name: "", type: voiceGroupForm.type })
                    }}
                    className="rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm font-semibold text-foreground-muted hover:text-foreground"
                  >
                    Cancel
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={saveVoiceGroup}
                  disabled={!voiceGroupForm.name.trim() || episodeSaving}
                  className={cn(
                    "rounded-xl px-5 py-2.5 text-sm font-semibold",
                    !voiceGroupForm.name.trim() || episodeSaving
                      ? "bg-primary/40 text-primary-foreground/70 cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {episodeSaving ? "Saving…" : editingVoiceGroupId ? "Save Group" : "Add Group"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Existing Voice Groups</h3>
              {voiceGroups === null ? (
                <div className="text-sm text-foreground-muted">Loading…</div>
              ) : (voiceGroups || []).length === 0 ? (
                <div className="text-sm text-foreground-muted">No voice groups yet.</div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background p-1">
                    {([
                      { key: "all" as const, label: "All" },
                      { key: "dub" as const, label: "Dubbed" },
                      { key: "sub" as const, label: "Subbed" },
                    ] as const).map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setExistingGroupsFilter(t.key)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                          existingGroupsFilter === t.key
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground-muted hover:text-foreground hover:bg-background-tertiary/30"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-xs font-semibold text-foreground-muted">Dub groups</div>
                      <div className="text-xs text-foreground-subtle">{dubVoiceGroups.length}</div>
                    </div>
                    {existingGroupsFilter === "sub" ? null : dubVoiceGroups.length === 0 ? (
                      <div className="text-sm text-foreground-muted">No dub groups.</div>
                    ) : (
                      <div className="space-y-2">
                        {dubVoiceGroups.map((g) => (
                          <div key={g.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background-secondary/30 px-4 py-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-foreground truncate">{g.name}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => startEditVoiceGroup(g)}
                                className="rounded-lg border border-border/60 bg-background px-3 py-2 text-xs font-semibold text-foreground-muted hover:text-foreground"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteVoiceGroup(g)}
                                className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/15"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-xs font-semibold text-foreground-muted">Sub groups</div>
                      <div className="text-xs text-foreground-subtle">{subVoiceGroups.length}</div>
                    </div>
                    {existingGroupsFilter === "dub" ? null : subVoiceGroups.length === 0 ? (
                      <div className="text-sm text-foreground-muted">No sub groups.</div>
                    ) : (
                      <div className="space-y-2">
                        {subVoiceGroups.map((g) => (
                          <div key={g.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background-secondary/30 px-4 py-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-foreground truncate">{g.name}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => startEditVoiceGroup(g)}
                                className="rounded-lg border border-border/60 bg-background px-3 py-2 text-xs font-semibold text-foreground-muted hover:text-foreground"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteVoiceGroup(g)}
                                className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/15"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mt-5 rounded-2xl border border-border/60 bg-background p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-foreground-muted">Server</div>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setSelectedServerNumber(n)
                      setEditingEpisodeId(null)
                    }}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm font-semibold transition-colors",
                      selectedServerNumber === n
                        ? "border-primary/40 bg-primary/10 text-foreground"
                        : "border-border/60 bg-background text-foreground-muted hover:text-foreground hover:bg-background-tertiary/30"
                    )}
                  >
                    Server {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-foreground-muted">Category</div>
              <div className="flex items-center gap-2">
                {([
                  { key: "dub" as const, label: "Dubbed" },
                  { key: "sub" as const, label: "Subbed" },
                ] as const).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setSelectedGroupType(t.key)
                      setEditingEpisodeId(null)
                      const first = (voiceGroups || []).find((g) => g.type === t.key)
                      setSelectedGroupId(first ? first.id : null)
                      setEpisodeForm((p) => ({ ...p, group_id: first ? first.id : 0 }))
                    }}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm font-semibold transition-colors",
                      selectedGroupType === t.key
                        ? "border-primary/40 bg-primary/10 text-foreground"
                        : "border-border/60 bg-background text-foreground-muted hover:text-foreground hover:bg-background-tertiary/30"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Voice group</label>
              <select
                value={selectedGroupId ?? ""}
                onChange={(e) => {
                  const v = e.target.value ? Number(e.target.value) : null
                  setSelectedGroupId(v)
                  setEditingEpisodeId(null)
                  setEpisodeForm((p) => ({ ...p, group_id: v || 0 }))
                }}
                className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
              >
                <option value="">Select…</option>
                {groupsForType.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              {groupsForType.length === 0 && (
                <div className="text-xs text-foreground-muted">No groups yet for this category.</div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Quick add group</label>
              <div className="flex items-center gap-2">
                <input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder={selectedGroupType === "dub" ? "e.g., Anilibria" : "e.g., Crunchyroll"}
                  className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
                />
                <button
                  type="button"
                  onClick={quickAddGroup}
                  disabled={!newGroupName.trim() || episodeSaving}
                  className={cn(
                    "shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold",
                    !newGroupName.trim() || episodeSaving
                      ? "bg-primary/40 text-primary-foreground/70 cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border/60 bg-background p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {editingEpisodeId ? `Edit Episode #${episodeForm.number}` : "Add Episode"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground-muted">Episode Number</label>
                <input
                  type="number"
                  min={1}
                  value={episodeForm.number}
                  onChange={(e) => setEpisodeForm((p) => ({ ...p, number: Number(e.target.value) }))}
                  className="w-full h-10 rounded-xl bg-background border border-border/60 px-3 text-sm text-foreground outline-none focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground-muted">Duration (sec)</label>
                <input
                  type="number"
                  min={0}
                  value={episodeForm.duration || 0}
                  onChange={(e) => setEpisodeForm((p) => ({ ...p, duration: Number(e.target.value) }))}
                  className="w-full h-10 rounded-xl bg-background border border-border/60 px-3 text-sm text-foreground outline-none focus:border-primary/50"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground-muted">Video URL (direct or iframe src)</label>
                <input
                  value={episodeForm.video_url}
                  onChange={(e) => setEpisodeForm((p) => ({ ...p, video_url: e.target.value }))}
                  className="w-full h-10 rounded-xl bg-background border border-border/60 px-3 text-sm text-foreground outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={saveEpisode}
                disabled={!episodeForm.video_url.trim() || episodeSaving || !selectedGroupId}
                className={cn(
                  "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold",
                  !episodeForm.video_url.trim() || episodeSaving || !selectedGroupId
                    ? "bg-primary/40 text-primary-foreground/70 cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {episodeSaving ? "Saving…" : editingEpisodeId ? "Save Episode" : "Add Episode"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Existing Episodes</h3>
            {episodes === null ? (
              <div className="text-sm text-foreground-muted">Loading…</div>
            ) : episodes.length === 0 ? (
              <div className="text-sm text-foreground-muted">No episodes yet.</div>
            ) : (
              <div className="space-y-2">
                {episodes.map((ep) => (
                  <div key={ep.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background-secondary/30 px-4 py-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">Episode {ep.number}</div>
                      <div className="text-xs text-foreground-muted truncate">{ep.video_url}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEditEpisode(ep)}
                        className="rounded-lg border border-border/60 bg-background px-3 py-2 text-xs font-semibold text-foreground-muted hover:text-foreground"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteEpisode(ep)}
                        className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/15"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}
