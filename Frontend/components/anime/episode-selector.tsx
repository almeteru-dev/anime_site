"use client"

import { useState } from "react"
import { ChevronDown, Server, Headphones } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { AnimeStatusManager, type AnimeStatus } from "@/components/anime-status-manager"

interface Episode {
  number: number
  title: string
  thumbnail?: string
  duration: string
  isFiller?: boolean
}

interface Season {
  id: string
  name: string
  episodes: Episode[]
}

interface EpisodeSelectorProps {
  seasons: Season[]
  currentEpisode: number
  currentSeason: string
  onEpisodeSelect: (seasonId: string, episodeNumber: number) => void
  animeId?: string
}

export function EpisodeSelector({ 
  seasons, 
  currentEpisode, 
  currentSeason,
  onEpisodeSelect,
  animeId = "1"
}: EpisodeSelectorProps) {
  const [selectedServer, setSelectedServer] = useState("Server 1")
  const [selectedAudio, setSelectedAudio] = useState("Subbed")
  const [animeStatus, setAnimeStatus] = useState<AnimeStatus>(null)

  const servers = ["Server 1", "Server 2", "Server 3", "Backup"]
  const audioOptions = ["Subbed", "Dubbed", "Multi-Audio"]

  const handleStatusChange = async (id: string, newStatus: AnimeStatus) => {
    // In a real app, this would save to a database
    setAnimeStatus(newStatus)
    return Promise.resolve()
  }

  return (
    <section className="py-6 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Server & Audio Selectors */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Server Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-[#081229] border-[#1A2847] text-[#D1D9E6] hover:bg-[#0D1A3A] hover:border-[#A3CFFF]/30 hover:text-white"
              >
                <Server className="w-4 h-4 mr-2 text-[#00E5FF]" />
                {selectedServer}
                <ChevronDown className="w-4 h-4 ml-2 text-[#A3CFFF]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#081229] border-[#1A2847]">
              {servers.map((server) => (
                <DropdownMenuItem 
                  key={server}
                  onClick={() => setSelectedServer(server)}
                  className={`text-[#D1D9E6] hover:text-white hover:bg-[#0D1A3A] focus:bg-[#0D1A3A] focus:text-white cursor-pointer ${selectedServer === server ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : ''}`}
                >
                  {server}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Audio Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-[#081229] border-[#1A2847] text-[#D1D9E6] hover:bg-[#0D1A3A] hover:border-[#A3CFFF]/30 hover:text-white"
              >
                <Headphones className="w-4 h-4 mr-2 text-[#00E5FF]" />
                {selectedAudio}
                <ChevronDown className="w-4 h-4 ml-2 text-[#A3CFFF]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#081229] border-[#1A2847]">
              {audioOptions.map((audio) => (
                <DropdownMenuItem 
                  key={audio}
                  onClick={() => setSelectedAudio(audio)}
                  className={`text-[#D1D9E6] hover:text-white hover:bg-[#0D1A3A] focus:bg-[#0D1A3A] focus:text-white cursor-pointer ${selectedAudio === audio ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : ''}`}
                >
                  {audio}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add to List Selector */}
          <AnimeStatusManager
            animeId={animeId}
            currentStatus={animeStatus}
            onStatusChange={handleStatusChange}
            variant="default"
          />
        </div>

        {/* Season Tabs */}
        <Tabs defaultValue={currentSeason} className="w-full">
          <TabsList className="bg-[#081229] border border-[#1A2847] p-1 h-auto flex-wrap mb-6">
            {seasons.map((season) => (
              <TabsTrigger 
                key={season.id} 
                value={season.id}
                className="data-[state=active]:bg-[#00E5FF] data-[state=active]:text-[#040D1F] text-[#D1D9E6] hover:text-white px-4 py-2 font-medium transition-all duration-300"
              >
                {season.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {seasons.map((season) => (
            <TabsContent key={season.id} value={season.id}>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {season.episodes.map((episode) => (
                  <button
                    key={episode.number}
                    onClick={() => onEpisodeSelect(season.id, episode.number)}
                    className={`
                      relative p-3 rounded-lg font-semibold text-sm transition-all duration-300
                      ${currentEpisode === episode.number && currentSeason === season.id
                        ? 'bg-[#00E5FF] text-[#040D1F] shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                        : 'bg-[#081229] text-[#D1D9E6] border border-[#1A2847] hover:border-[#00E5FF]/50 hover:bg-[#0D1A3A] hover:text-white hover:shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                      }
                      ${episode.isFiller ? 'ring-2 ring-orange-500/30' : ''}
                    `}
                    title={episode.title}
                  >
                    {episode.number}
                    {episode.isFiller && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" title="Filler" />
                    )}
                  </button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
