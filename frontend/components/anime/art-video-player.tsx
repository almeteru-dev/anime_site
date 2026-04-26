"use client"

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import Artplayer from "artplayer"

export type ArtVideoPlayerHandle = {
  getCurrentTime: () => number
  isPlaying: () => boolean
}

export type ArtVideoPlayerProps = {
  url: string
  poster?: string
  initialTime?: number
  autoPlay?: boolean
  onTimeUpdate?: (time: number) => void
}

export const ArtVideoPlayer = forwardRef<ArtVideoPlayerHandle, ArtVideoPlayerProps>(
  function ArtVideoPlayer({ url, poster, initialTime, autoPlay, onTimeUpdate }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const artRef = useRef<Artplayer | null>(null)

    useImperativeHandle(ref, () => ({
      getCurrentTime: () => {
        const art = artRef.current
        if (!art) return 0
        const time = Number(art.currentTime)
        return Number.isFinite(time) ? time : 0
      },
      isPlaying: () => {
        const art = artRef.current
        return !!art?.playing
      },
    }))

    useEffect(() => {
      if (!containerRef.current) return

      const art = new Artplayer({
        container: containerRef.current,
        url,
        poster,
        autoplay: false,
        muted: false,
        pip: true,
        fullscreen: true,
        fullscreenWeb: true,
        setting: true,
        loop: false,
        hotkey: true,
        playbackRate: true,
      })

      artRef.current = art

      const seek = () => {
        const t = typeof initialTime === "number" ? initialTime : 0
        if (t > 0) art.currentTime = t
        if (autoPlay) art.play()
      }

      const onVideoTimeUpdate = () => {
        if (!onTimeUpdate) return
        const time = Number(art.currentTime)
        if (Number.isFinite(time)) onTimeUpdate(time)
      }

      art.on("ready", seek)
      art.on("video:timeupdate", onVideoTimeUpdate)

      return () => {
        art.off("video:timeupdate", onVideoTimeUpdate)
        artRef.current = null
        art.destroy(false)
      }
    }, [autoPlay, initialTime, onTimeUpdate, poster, url])

    return <div ref={containerRef} className="w-full h-full" />
  }
)
