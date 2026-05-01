"use client"

import { Info, Languages, Tv } from "lucide-react"
import { type Anime, getLocalizedDescription } from "@/lib/api"
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
    status: anime.status?.name || "N/A",
    studio: anime.studio?.name || "N/A",
    source: anime.source?.name || "N/A",
    airedOn: anime.aired_on ? new Date(anime.aired_on).toLocaleDateString() : "N/A",
    releasedOn: anime.released_on ? new Date(anime.released_on).toLocaleDateString() : "N/A",
    episodes: anime.episodes > 0 ? `${anime.episodes_aired ?? 0} of ${anime.episodes}` : "N/A",
    duration: `${anime.duration} min per ep`,
    rating: anime.rating || "N/A",
  }

  const labels = {
    synopsis: locale === "ru" ? "Синопсис" : "Synopsis",
    genres: locale === "ru" ? "Жанры" : "Genres",
    altTitles: locale === "ru" ? "Альтернативные названия" : "Alternative Titles",
    details: locale === "ru" ? "Детали" : "Details",
    type: locale === "ru" ? "Тип" : "Type",
    status: locale === "ru" ? "Статус" : "Status",
    studio: locale === "ru" ? "Студия" : "Studio",
    source: locale === "ru" ? "Источник" : "Source",
    releasedOn: locale === "ru" ? "Дата релиза" : "Released on",
    airedOn: locale === "ru" ? "Дата старта" : "Aired on",
    episodes: locale === "ru" ? "Вышло серий" : "Aired",
    duration: locale === "ru" ? "Длительность" : "Duration",
    rating: locale === "ru" ? "Рейтинг" : "Rating",
    romaji: locale === "ru" ? "Ромадзи" : "Romaji",
    russian: locale === "ru" ? "Русский" : "Russian",
  }

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Synopsis */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-[#00E5FF]" />
              <h2 className="text-xl font-bold text-white">{labels.synopsis}</h2>
            </div>
            <div className="bg-[#081229] rounded-xl p-6 border border-[#1A2847] shadow-[inset_0_2px_10px_rgba(0,229,255,0.05)]">
              <p className="text-[#D1D9E6] leading-relaxed text-base">
                {getLocalizedDescription(anime, locale)}
              </p>

			  {(anime.genres || []).length > 0 ? (
				<div className="mt-5">
				  <div className="text-sm font-semibold text-white mb-2">{labels.genres}</div>
				  <div className="flex flex-wrap gap-2">
					{(anime.genres || []).map((g) => (
					  <span
						key={g.id}
						className="inline-flex items-center gap-2 rounded-lg border border-[#1A2847] bg-[#0D1A3A] px-3 py-1.5 text-sm text-[#D1D9E6]"
					  >
						<span className="truncate max-w-[180px]">{g.name}</span>
					  </span>
					))}
				  </div>
				</div>
			  ) : null}
            </div>

            {/* Alternative Titles */}
            <div className="bg-[#081229] rounded-xl p-6 border border-[#1A2847] shadow-[inset_0_2px_10px_rgba(0,229,255,0.05)]">
              <div className="flex items-center gap-2 mb-4">
                <Languages className="w-5 h-5 text-[#00E5FF]" />
                <h3 className="text-lg font-semibold text-white">{labels.altTitles}</h3>
              </div>
              <div className="space-y-2">
                {alternativeTitles.romaji && (
                  <div className="flex gap-2">
                    <span className="text-[#A3CFFF] font-medium min-w-[80px]">{labels.romaji}:</span>
                    <span className="text-[#D1D9E6]">{alternativeTitles.romaji}</span>
                  </div>
                )}
                {alternativeTitles.russian && (
                  <div className="flex gap-2">
                    <span className="text-[#A3CFFF] font-medium min-w-[80px]">{labels.russian}:</span>
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
              <h2 className="text-xl font-bold text-white">{labels.details}</h2>
            </div>
            <div className="bg-[#081229] rounded-xl p-6 border border-[#1A2847] shadow-[inset_0_2px_10px_rgba(0,229,255,0.05)]">
              <div className="space-y-4">
                {details.type !== "N/A" ? <DetailRow label={labels.type} value={details.type} /> : null}
                {details.status !== "N/A" ? <DetailRow label={labels.status} value={details.status} /> : null}
                {details.studio !== "N/A" ? <DetailRow label={labels.studio} value={details.studio} /> : null}
                {details.source !== "N/A" ? <DetailRow label={labels.source} value={details.source} /> : null}
                {details.airedOn !== "N/A" ? <DetailRow label={labels.airedOn} value={details.airedOn} /> : null}
                {details.releasedOn !== "N/A" ? <DetailRow label={labels.releasedOn} value={details.releasedOn} /> : null}
                {details.episodes !== "N/A" ? <DetailRow label={labels.episodes} value={details.episodes} /> : null}
                {details.duration !== "N/A" ? <DetailRow label={labels.duration} value={details.duration} /> : null}
                {details.rating !== "N/A" ? <DetailRow label={labels.rating} value={details.rating} /> : null}
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
