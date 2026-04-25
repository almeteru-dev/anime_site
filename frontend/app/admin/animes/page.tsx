"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { PlusCircle, Trash2, Pencil, Search } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { adminDeleteAnime, getAnimes, getLocalizedTitle, type Anime } from "@/lib/api"

export default function AdminAnimesPage() {
  const { token } = useAuth()
  const { locale } = useLanguage()
  const [animes, setAnimes] = useState<Anime[] | null>(null)
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await getAnimes()
        if (mounted) setAnimes(data)
      } catch (e: any) {
        if (mounted) setError(e.message || "Failed to load")
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    if (!animes) return []
    const q = query.trim().toLowerCase()
    if (!q) return animes
    return animes.filter((a) => {
      const title = getLocalizedTitle(a, locale).toLowerCase()
      return title.includes(q) || a.url.toLowerCase().includes(q)
    })
  }, [animes, locale, query])

  const handleDelete = async (id: string) => {
    if (!token) return
    const ok = window.confirm("Delete this anime? This cannot be undone.")
    if (!ok) return

    try {
      await adminDeleteAnime({ token, id })
      setAnimes((prev) => (prev ? prev.filter((a) => String(a.id) !== id) : prev))
    } catch (e: any) {
      setError(e.message || "Failed to delete")
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Anime</h1>
          <p className="text-sm text-foreground-muted">Manage your catalog entries</p>
        </div>
        <Link
          href="/admin/animes/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <PlusCircle className="w-4 h-4" />
          Add Anime
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-border/60 bg-background-secondary/40">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
          <Search className="w-4 h-4 text-foreground-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or slug"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-subtle outline-none"
          />
        </div>

        {error && (
          <div className="px-4 py-3 text-sm text-red-400 border-b border-red-500/30 bg-red-500/10">{error}</div>
        )}

        {animes === null ? (
          <div className="p-6 text-sm text-foreground-muted">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-foreground-muted">No anime found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-foreground-subtle">
                <tr className="border-b border-border/50">
                  <th className="text-left font-semibold px-4 py-3">Title</th>
                  <th className="text-left font-semibold px-4 py-3">Slug</th>
                  <th className="text-left font-semibold px-4 py-3">Status</th>
                  <th className="text-left font-semibold px-4 py-3">Year</th>
                  <th className="text-right font-semibold px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-border/40 hover:bg-background-tertiary/30">
                    <td className="px-4 py-3 font-medium text-foreground">{getLocalizedTitle(a, locale)}</td>
                    <td className="px-4 py-3 text-foreground-muted">{a.url}</td>
                    <td className="px-4 py-3 text-foreground-muted">{a.status?.name || ""}</td>
                    <td className="px-4 py-3 text-foreground-muted">{a.aired_on ? new Date(a.aired_on).getFullYear() : ""}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/animes/${a.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2 text-xs font-semibold text-foreground-muted hover:text-foreground"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </Link>
                        <button
                          className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/15"
                          onClick={() => handleDelete(String(a.id))}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
