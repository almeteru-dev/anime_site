"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getMyCollection, rateAnime } from "@/lib/api"

export function AnimeRating({ animeId }: { animeId: number }) {
  const { token } = useAuth()
  const [isWatched, setIsWatched] = useState<boolean | null>(null)
  const [value, setValue] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!token) {
        if (mounted) setIsWatched(null)
        return
      }
      try {
        const items = await getMyCollection({ token })
        const entry = items.find((x) => x.anime_id === animeId)
        if (mounted) setIsWatched(entry?.collection_type?.name === "completed")
      } catch {
        if (mounted) setIsWatched(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [animeId, token])

  const options = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => String(i))
  }, [])

  const disabled = !token || isWatched !== true || isSaving

  const onChange = async (next: string) => {
    setValue(next)
    setError(null)
    if (!token) return
    if (isWatched !== true) return
    if (next === "") return

    const num = Number(next)
    if (!Number.isInteger(num) || num < 0 || num > 9) {
      setError("Rating must be between 0 and 9")
      return
    }

    setIsSaving(true)
    try {
      await rateAnime({ token, animeId, rating: num })
    } catch (e: any) {
      setError(e?.message || "Failed to save rating")
    } finally {
      setIsSaving(false)
    }
  }

  if (!token) {
    return null
  }

  return (
    <div className="mt-2">
      <div className="text-xs text-[#A3CFFF]">Your rating</div>
      <div className="mt-1 flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-9 rounded-lg border border-[#1A2847] bg-[#0D1A3A] px-3 text-sm text-white disabled:opacity-60"
        >
          <option value="">Select</option>
          {options.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        {isWatched === false ? (
          <div className="text-xs text-[#D1D9E6]">Only “Watched” can rate</div>
        ) : null}
      </div>

      {error ? <div className="mt-1 text-xs text-red-400">{error}</div> : null}
    </div>
  )
}

