"use client";

import { AnimeCard } from "./anime-card";
import { CalendarOff } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

type ScheduleCardItem = {
  time: string
  title: string
  episode: number
  posterUrl: string
  slug: string
}

interface ReleaseListProps {
  releases: ScheduleCardItem[];
}

export function ReleaseList({ releases }: ReleaseListProps) {
  const { locale } = useLanguage()

  if (releases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#0A1628] border border-[#1A2744] flex items-center justify-center mb-4">
          <CalendarOff className="w-8 h-8 text-[#8BA3C7]" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          {locale === "ru" ? "Нет релизов" : "No Releases"}
        </h3>
        <p className="text-[#8BA3C7] text-sm max-w-xs">
          {locale === "ru"
            ? "На данный день выход аниме не запланирован"
            : "No anime releases scheduled for this day."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {releases.map((anime) => (
        <AnimeCard
          key={`${anime.slug}-${anime.episode}-${anime.time}`}
          anime={anime}
        />
      ))}
    </div>
  );
}
