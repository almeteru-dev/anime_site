"use client"

import { ChevronDown, Headphones, Server } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export type PlayerSourceKind = "iframe" | "direct" | "placeholder"

export type PlayerSource = {
  id: string
  server: string
  audio: string
  kind: PlayerSourceKind
  url?: string
}

export type SourceSelectorProps = {
  sources: PlayerSource[]
  selectedServer: string
  selectedAudio: string
  onChangeServer: (server: string) => void
  onChangeAudio: (audio: string) => void
}

export function SourceSelector({
  sources,
  selectedServer,
  selectedAudio,
  onChangeServer,
  onChangeAudio,
}: SourceSelectorProps) {
  const servers = Array.from(new Set(sources.map((s) => s.server)))
  const audios = Array.from(
    new Set(sources.filter((s) => s.server === selectedServer).map((s) => s.audio))
  )

  return (
    <div className="flex flex-wrap gap-4">
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
              onClick={() => onChangeServer(server)}
              className={`text-[#D1D9E6] hover:text-white hover:bg-[#0D1A3A] focus:bg-[#0D1A3A] focus:text-white cursor-pointer ${
                selectedServer === server ? "bg-[#00E5FF]/10 text-[#00E5FF]" : ""
              }`}
            >
              {server}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

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
          {audios.map((audio) => (
            <DropdownMenuItem
              key={audio}
              onClick={() => onChangeAudio(audio)}
              className={`text-[#D1D9E6] hover:text-white hover:bg-[#0D1A3A] focus:bg-[#0D1A3A] focus:text-white cursor-pointer ${
                selectedAudio === audio ? "bg-[#00E5FF]/10 text-[#00E5FF]" : ""
              }`}
            >
              {audio}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

