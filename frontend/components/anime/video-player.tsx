"use client"

import { useState } from "react"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  SkipBack, 
  SkipForward,
  Subtitles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface VideoPlayerProps {
  posterImage: string
  title: string
  episode: number
  source?: { type: "iframe" | "video"; src: string } | null
}

export function VideoPlayer({ posterImage, title, episode, source }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState([0])
  const [volume, setVolume] = useState([80])
  const [showControls, setShowControls] = useState(true)

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Player Container */}
        <div 
          className="relative w-full aspect-video bg-[#081229] rounded-2xl overflow-hidden border border-[#1A2847] shadow-[0_0_50px_rgba(0,229,255,0.1)] group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => !isPlaying && setShowControls(true)}
        >
          {/* Player */}
          {source ? (
            source.type === "iframe" ? (
              <iframe
                src={source.src}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                className="absolute inset-0 w-full h-full"
                src={source.src}
                poster={posterImage}
                controls
              />
            )
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${posterImage})` }}
            >
              <div className="absolute inset-0 bg-[#040D1F]/40" />
            </div>
          )}

          {/* Episode Info Overlay */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-[#040D1F]/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#1A2847]">
              <p className="text-white font-semibold">{title}</p>
              <p className="text-[#A3CFFF] text-sm">Episode {episode}</p>
            </div>
          </div>

          {/* Big Play Button (Center) */}
          {!source && !isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <button
                onClick={() => setIsPlaying(true)}
                className="w-20 h-20 rounded-full bg-[#00E5FF]/90 hover:bg-[#00E5FF] flex items-center justify-center shadow-[0_0_40px_rgba(0,229,255,0.5)] hover:shadow-[0_0_60px_rgba(0,229,255,0.7)] transition-all duration-300 hover:scale-110"
              >
                <Play className="w-8 h-8 text-[#040D1F] fill-current ml-1" />
              </button>
            </div>
          )}

          {/* Bottom Controls (visual only when embedded) */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#040D1F] via-[#040D1F]/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
          >
            {/* Progress Bar */}
            <div className="mb-4 px-2">
              <Slider
                value={progress}
                onValueChange={setProgress}
                max={100}
                step={1}
                className="[&_[data-slot=slider-thumb]]:bg-[#00E5FF] [&_[data-slot=slider-thumb]]:border-[#00E5FF] [&_[data-slot=slider-thumb]]:shadow-[0_0_10px_rgba(0,229,255,0.5)] [&_[data-slot=slider-track]]:bg-[#1A2847] [&_[data-slot=slider-range]]:bg-[#00E5FF]"
              />
              <div className="flex justify-between text-xs text-[#A3CFFF] mt-1">
                <span>0:00</span>
                <span>24:30</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-[#00E5FF] hover:bg-[#00E5FF]/10"
                  onClick={() => {}}
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 w-12 h-12"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-[#00E5FF] hover:bg-[#00E5FF]/10"
                  onClick={() => {}}
                >
                  <SkipForward className="w-5 h-5" />
                </Button>

                {/* Volume */}
                <div className="flex items-center gap-2 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-[#00E5FF] hover:bg-[#00E5FF]/10"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                  <div className="w-20 hidden sm:block">
                    <Slider
                      value={isMuted ? [0] : volume}
                      onValueChange={setVolume}
                      max={100}
                      step={1}
                      className="[&_[data-slot=slider-thumb]]:bg-[#00E5FF] [&_[data-slot=slider-thumb]]:border-[#00E5FF] [&_[data-slot=slider-track]]:bg-[#1A2847] [&_[data-slot=slider-range]]:bg-[#00E5FF]"
                    />
                  </div>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-[#00E5FF] hover:bg-[#00E5FF]/10"
                >
                  <Subtitles className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-[#00E5FF] hover:bg-[#00E5FF]/10"
                >
                  <Settings className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-[#00E5FF] hover:bg-[#00E5FF]/10"
                >
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
