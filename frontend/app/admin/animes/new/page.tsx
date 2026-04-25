"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { adminCreateAnime, adminGetMeta, type AdminCreateAnimeInput, type AdminMeta } from "@/lib/api"
import { cn } from "@/lib/utils"
import { slugify } from "@/lib/slug"

export default function AdminAddAnimePage() {
  const { token } = useAuth()
  const [meta, setMeta] = useState<AdminMeta | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<AdminCreateAnimeInput>({
    url: "",
    title_ru: "",
    title_en_romaji: "",
    description_ru: "",
    description_en: "",
    poster_url: "",
    status_id: null,
    studio_id: null,
    source_id: null,
    genre_ids: [],
    kind: "tv",
    episodes: 12,
    duration: 24,
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!token) return
      try {
        const data = await adminGetMeta({ token })
        if (mounted) setMeta(data)
      } catch (e: any) {
        if (mounted) setError(e.message || "Failed to load metadata")
      }
    })()
    return () => {
      mounted = false
    }
  }, [token])

  useEffect(() => {
    setForm((p) => ({ ...p, url: slugify(p.title_en_romaji) }))
  }, [form.title_en_romaji])

  const canSubmit = useMemo(() => {
    return !!form.url.trim() && !!form.title_ru.trim() && !!form.title_en_romaji.trim()
  }, [form.title_en_romaji, form.title_ru, form.url])

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
      await adminCreateAnime({ token, input: form })
      window.location.href = "/admin/animes"
    } catch (e: any) {
      setError(e.message || "Failed to create")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add Anime</h1>
          <p className="text-sm text-foreground-muted">Create a new anime entry with RU + EN (Romaji)</p>
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
                value={form.url}
                placeholder="e.g. solo-leveling"
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

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Title (RU)</label>
              <input
                value={form.title_ru}
                onChange={(e) => setForm((p) => ({ ...p, title_ru: e.target.value }))}
                className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground-muted">Title (EN Romaji)</label>
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
                rows={4}
                className="w-full rounded-xl bg-background border border-border/60 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-semibold text-foreground-muted">Description (EN Romaji)</label>
              <textarea
                value={form.description_en || ""}
                onChange={(e) => setForm((p) => ({ ...p, description_en: e.target.value }))}
                rows={4}
                className="w-full rounded-xl bg-background border border-border/60 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50"
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
              <label className="text-xs font-semibold text-foreground-muted">Duration (min)</label>
              <input
                type="number"
                min={0}
                value={form.duration ?? 0}
                onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))}
                className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-semibold text-foreground-muted">Genres</label>
              <div className="rounded-xl border border-border/60 bg-background p-3 max-h-48 overflow-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(meta?.genres || []).map((g) => {
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
              {isLoading ? "Saving…" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
