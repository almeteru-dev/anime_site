"use client"

import { Info, Languages, Clock, Tv } from "lucide-react"
import { type Anime, getLocalizedTitle, getLocalizedDescription } from "@/lib/api"
import { useLanguage } from "@/contexts/language-context"

interface SynopsisSectionProps {
  anime: Anime
}

export function SynopsisSection({ anime }: SynopsisSectionProps) {
  const { locale } = useLanguage()
  
  const alternativeTitles = {
    romaji: anime.translations?.find(t => t.language.code === "en")?.title,
    russian: anime.translations?.find(t => t.language.code === "ru")?.title,
  }

  const details = {
    type: anime.kind || "TV",
    source: anime.source?.name || "N/A",
    premiered: anime.aired_on ? new Date(anime.aired_on).toLocaleDateString() : "N/A",
    aired: anime.aired_on ? new Date(anime.aired_on).toLocaleDateString() : "N/A",
    duration: `${anime.duration} min per ep`,
    rating: anime.rating || "N/A",
  }

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Synopsis */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-[#00E5FF]" />
              <h2 className="text-xl font-bold text-white">Synopsis</h2>
            </div>
            <div className="bg-[#081229] rounded-xl p-6 border border-[#1A2847] shadow-[inset_0_2px_10px_rgba(0,229,255,0.05)]">
              <p className="text-[#D1D9E6] leading-relaxed text-base">
                {getLocalizedDescription(anime, locale)}
              </p>
            </div>

            {/* Alternative Titles */}
            <div className="bg-[#081229] rounded-xl p-6 border border-[#1A2847] shadow-[inset_0_2px_10px_rgba(0,229,255,0.05)]">
              <div className="flex items-center gap-2 mb-4">
                <Languages className="w-5 h-5 text-[#00E5FF]" />
                <h3 className="text-lg font-semibold text-white">Alternative Titles</h3>
              </div>
              <div className="space-y-2">
                {alternativeTitles.romaji && (
                  <div className="flex gap-2">
                    <span className="text-[#A3CFFF] font-medium min-w-[80px]">Romaji:</span>
                    <span className="text-[#D1D9E6]">{alternativeTitles.romaji}</span>
                  </div>
                )}
                {alternativeTitles.russian && (
                  <div className="flex gap-2">
                    <span className="text-[#A3CFFF] font-medium min-w-[80px]">Russian:</span>
                    <span className="text-[#D1D9E6]">{alternativeTitles.russian}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Production Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Tv className="w-5 h-5 text-[#00E5FF]" />
              <h2 className="text-xl font-bold text-white">Details</h2>
            </div>
            <div className="bg-[#081229] rounded-xl p-6 border border-[#1A2847] shadow-[inset_0_2px_10px_rgba(0,229,255,0.05)]">
              <div className="space-y-4">
                <DetailRow label="Type" value={details.type} />
                <DetailRow label="Source" value={details.source} />
                <DetailRow label="Premiered" value={details.premiered} />
                <DetailRow label="Aired" value={details.aired} />
                <DetailRow label="Duration" value={details.duration} />
                <DetailRow label="Rating" value={details.rating} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#1A2847] last:border-0">
      <span className="text-[#A3CFFF] font-medium">{label}</span>
      <span className="text-[#D1D9E6]">{value}</span>
    </div>
  )
}
