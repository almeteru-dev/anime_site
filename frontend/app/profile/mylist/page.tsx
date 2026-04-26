"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ListVideo, Tv } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { getAnimePosterUrl, getLocalizedTitle, getMyCollection, removeFromMyCollection, addToMyCollection, type UserCollectionEntry, type WatchlistStatus } from "@/lib/api"
import { UserCollectionCard } from "@/components/user-collection-card"
import type { AnimeStatus } from "@/components/anime-status-manager"

export default function MyListPage() {
  const { token, user } = useAuth()
  const { t, locale } = useLanguage()
  const [items, setItems] = useState<UserCollectionEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!token) {
        setItems([])
        return
      }
      try {
        const data = await getMyCollection({ token })
        if (mounted) setItems(data)
      } catch (e: any) {
        if (mounted) setError(e.message || "Failed to load")
      }
    })()

    return () => {
      mounted = false
    }
  }, [token])

  const mapBackendToUiStatus = (name: string): AnimeStatus => {
    const n = (name || "").toLowerCase()
    if (n === "watching" || n === "planned" || n === "completed" || n === "on_hold" || n === "dropped") return n as AnimeStatus
    return "planned"
  }

  const cards = useMemo(() => {
    if (!items) return []
    return items.map((entry) => {
      const anime = entry.anime
      const title = getLocalizedTitle(anime, locale)
      const image = getAnimePosterUrl(anime) || `https://placehold.co/300x400/081229/00E5FF?text=${encodeURIComponent(title)}`
      const status = mapBackendToUiStatus(entry.collection_type?.name)

      return { entry, anime, title, image, status }
    })
  }, [items, locale])

  const handleStatusChange = async (animeId: string, newStatus: AnimeStatus) => {
    if (!token) return
    if (!newStatus) return
    await addToMyCollection({ animeId, status: newStatus as WatchlistStatus, token })
    const refreshed = await getMyCollection({ token })
    setItems(refreshed)
  }

  const handleRemove = async (animeId: string) => {
    if (!token) return
    await removeFromMyCollection({ animeId, token })
    setItems((prev) => (prev ? prev.filter((e) => String(e.anime_id) !== String(animeId)) : prev))
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <ListVideo className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My List</h1>
              <p className="text-sm text-foreground-muted">{user?.email || ""}</p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-background-secondary/50 px-4 py-2 text-sm font-medium text-foreground-muted hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        {!token ? (
          <div className="rounded-2xl border border-border/50 bg-background-secondary/40 p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center">
              <Tv className="w-7 h-7 text-foreground-subtle" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Sign in to view your list</h2>
            <p className="mt-1 text-sm text-foreground-muted">Your watchlist is tied to your account.</p>
            <Link
              href="/login"
              className="inline-flex mt-6 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {t.nav.signIn}
            </Link>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-red-400">{error}</div>
        ) : items === null ? (
          <div className="rounded-2xl border border-border/50 bg-background-secondary/40 p-8 animate-pulse">
            <div className="h-5 w-40 bg-muted/40 rounded" />
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl bg-muted/30" />
              ))}
            </div>
          </div>
        ) : cards.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-background-secondary/40 p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center">
              <Tv className="w-7 h-7 text-foreground-subtle" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Your list is empty</h2>
            <p className="mt-1 text-sm text-foreground-muted">Add anime from the catalog to see them here.</p>
            <Link
              href="/catalog"
              className="inline-flex mt-6 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Browse catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {cards.map(({ entry, title, image, status }) => (
              <UserCollectionCard
                key={entry.id}
                animeId={String(entry.anime_id)}
                slug={entry.anime.url}
                title={title}
                image={image}
                rating={entry.anime.score}
                episodes={entry.anime.episodes}
                status={status}
                showDelete
                onStatusChange={handleStatusChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
