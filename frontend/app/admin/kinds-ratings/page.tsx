"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  adminCreateKind,
  adminCreateRating,
  adminCreateSource,
  adminCreateStatus,
  adminCreateStudio,
  adminDeleteKind,
  adminDeleteRating,
  adminDeleteSource,
  adminDeleteStatus,
  adminDeleteStudio,
  adminListKinds,
  adminListRatings,
  adminListSources,
  adminListStatuses,
  adminListStudios,
  adminUpdateKind,
  adminUpdateRating,
  adminUpdateSource,
  adminUpdateStatus,
  adminUpdateStudio,
  type KindOption,
  type RatingOption,
  type Source,
  type Status,
  type Studio,
} from "@/lib/api"
import { cn } from "@/lib/utils"

export default function AdminKindsRatingsPage() {
  const { token } = useAuth()
  const [tab, setTab] = useState<"kinds" | "ratings" | "statuses" | "studios" | "sources">("kinds")
  const [kinds, setKinds] = useState<KindOption[] | null>(null)
  const [ratings, setRatings] = useState<RatingOption[] | null>(null)
  const [statuses, setStatuses] = useState<Status[] | null>(null)
  const [studios, setStudios] = useState<Studio[] | null>(null)
  const [sources, setSources] = useState<Source[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")

  const activeList = useMemo(() => {
    if (tab === "kinds") return kinds
    if (tab === "ratings") return ratings
    if (tab === "statuses") return statuses
    if (tab === "studios") return studios
    return sources
  }, [kinds, ratings, sources, statuses, studios, tab])

  const tabLabel = useMemo(() => {
    if (tab === "kinds") return "Kind"
    if (tab === "ratings") return "Rating"
    if (tab === "statuses") return "Status"
    if (tab === "studios") return "Studio"
    return "Source"
  }, [tab])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!token) return
      try {
        const [k, r, st, su, so] = await Promise.all([
          adminListKinds({ token }),
          adminListRatings({ token }),
          adminListStatuses({ token }),
          adminListStudios({ token }),
          adminListSources({ token }),
        ])
        if (!mounted) return
        setKinds(k)
        setRatings(r)
        setStatuses(st)
        setStudios(su)
        setSources(so)
      } catch (e: any) {
        if (!mounted) return
        setError(e.message || "Failed to load")
      }
    })()
    return () => {
      mounted = false
    }
  }, [token])

  const startEdit = (id: number, name: string) => {
    setEditingId(id)
    setEditingName(name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName("")
  }

  const saveEdit = async () => {
    if (!token) return
    const name = editingName.trim()
    if (!editingId || !name) return
    setSaving(true)
    setError(null)
    try {
      if (tab === "kinds") {
        const updated = await adminUpdateKind({ token, id: editingId, name })
        setKinds((prev) => (prev ? prev.map((x) => (x.id === updated.id ? updated : x)).sort((a, b) => a.name.localeCompare(b.name)) : prev))
      } else {
        if (tab === "ratings") {
          const updated = await adminUpdateRating({ token, id: editingId, name })
          setRatings((prev) => (prev ? prev.map((x) => (x.id === updated.id ? updated : x)).sort((a, b) => a.name.localeCompare(b.name)) : prev))
        } else if (tab === "statuses") {
          const updated = await adminUpdateStatus({ token, id: editingId, name })
          setStatuses((prev) => (prev ? prev.map((x) => (x.id === updated.id ? updated : x)).sort((a, b) => a.name.localeCompare(b.name)) : prev))
        } else if (tab === "studios") {
          const updated = await adminUpdateStudio({ token, id: editingId, name })
          setStudios((prev) => (prev ? prev.map((x) => (x.id === updated.id ? updated : x)).sort((a, b) => a.name.localeCompare(b.name)) : prev))
        } else {
          const updated = await adminUpdateSource({ token, id: editingId, name })
          setSources((prev) => (prev ? prev.map((x) => (x.id === updated.id ? updated : x)).sort((a, b) => a.name.localeCompare(b.name)) : prev))
        }
      }
      cancelEdit()
    } catch (e: any) {
      setError(e.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const create = async () => {
    if (!token) return
    const name = newName.trim()
    if (!name) return
    setSaving(true)
    setError(null)
    try {
      if (tab === "kinds") {
        const created = await adminCreateKind({ token, name })
        setKinds((prev) => ([...(prev || []), created].sort((a, b) => a.name.localeCompare(b.name))))
      } else if (tab === "ratings") {
        const created = await adminCreateRating({ token, name })
        setRatings((prev) => ([...(prev || []), created].sort((a, b) => a.name.localeCompare(b.name))))
      } else if (tab === "statuses") {
        const created = await adminCreateStatus({ token, name })
        setStatuses((prev) => ([...(prev || []), created].sort((a, b) => a.name.localeCompare(b.name))))
      } else if (tab === "studios") {
        const created = await adminCreateStudio({ token, name })
        setStudios((prev) => ([...(prev || []), created].sort((a, b) => a.name.localeCompare(b.name))))
      } else {
        const created = await adminCreateSource({ token, name })
        setSources((prev) => ([...(prev || []), created].sort((a, b) => a.name.localeCompare(b.name))))
      }
      setNewName("")
    } catch (e: any) {
      setError(e.message || "Failed to create")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    if (!token) return
    setSaving(true)
    setError(null)
    try {
      if (tab === "kinds") {
        await adminDeleteKind({ token, id })
        setKinds((prev) => (prev ? prev.filter((x) => x.id !== id) : prev))
      } else if (tab === "ratings") {
        await adminDeleteRating({ token, id })
        setRatings((prev) => (prev ? prev.filter((x) => x.id !== id) : prev))
      } else if (tab === "statuses") {
        await adminDeleteStatus({ token, id })
        setStatuses((prev) => (prev ? prev.filter((x) => x.id !== id) : prev))
      } else if (tab === "studios") {
        await adminDeleteStudio({ token, id })
        setStudios((prev) => (prev ? prev.filter((x) => x.id !== id) : prev))
      } else {
        await adminDeleteSource({ token, id })
        setSources((prev) => (prev ? prev.filter((x) => x.id !== id) : prev))
      }
      if (editingId === id) cancelEdit()
    } catch (e: any) {
      setError(e.message || "Failed to delete")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kinds & Ratings</h1>
          <p className="text-sm text-foreground-muted">Manage dropdown lists for anime metadata</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 rounded-xl border border-border/60 bg-background p-1">
        {([
          { key: "kinds" as const, label: "Kinds" },
          { key: "ratings" as const, label: "Ratings" },
          { key: "statuses" as const, label: "Statuses" },
          { key: "studios" as const, label: "Studios" },
          { key: "sources" as const, label: "Sources" },
        ] as const).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key)
              cancelEdit()
              setNewName("")
            }}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              tab === t.key ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:text-foreground hover:bg-background-tertiary/30"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border/60 bg-background p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Add {tabLabel}</h3>
          <div className="flex items-center gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={tab === "kinds" ? "e.g., tv" : tab === "ratings" ? "e.g., r-17+" : `e.g., ${tabLabel.toLowerCase()}`}
              className="w-full h-11 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
            />
            <button
              type="button"
              onClick={create}
              disabled={!newName.trim() || saving}
              className={cn(
                "shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold",
                !newName.trim() || saving ? "bg-primary/40 text-primary-foreground/70 cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              Add
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Existing {tab === "kinds" ? "Kinds" : tab === "ratings" ? "Ratings" : tab === "statuses" ? "Statuses" : tab === "studios" ? "Studios" : "Sources"}</h3>
          {activeList === null ? (
            <div className="text-sm text-foreground-muted">Loading…</div>
          ) : activeList.length === 0 ? (
            <div className="text-sm text-foreground-muted">No items yet.</div>
          ) : (
            <div className="space-y-2">
              {activeList.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background-secondary/30 px-4 py-3">
                  <div className="min-w-0">
                    {editingId === item.id ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full h-10 rounded-xl bg-background border border-border/60 px-3 text-sm text-foreground outline-none focus:border-primary/50"
                      />
                    ) : (
                      <div className="text-sm font-semibold text-foreground truncate">{item.name}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editingId === item.id ? (
                      <>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-lg border border-border/60 bg-background px-3 py-2 text-xs font-semibold text-foreground-muted hover:text-foreground"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveEdit}
                          disabled={!editingName.trim() || saving}
                          className={cn(
                            "rounded-lg px-3 py-2 text-xs font-semibold",
                            !editingName.trim() || saving
                              ? "bg-primary/40 text-primary-foreground/70 cursor-not-allowed"
                              : "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                        >
                          Save
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(item.id, item.name)}
                          className="rounded-lg border border-border/60 bg-background px-3 py-2 text-xs font-semibold text-foreground-muted hover:text-foreground"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          disabled={saving}
                          className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/15"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
