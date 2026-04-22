"use client";

import { AnimeRelease } from "@/lib/schedule-data";
import { AnimeCard } from "./anime-card";
import { CalendarOff } from "lucide-react";

interface ReleaseListProps {
  releases: AnimeRelease[];
  onToggleReminder: (id: string) => void;
  dayName: string;
}

export function ReleaseList({ releases, onToggleReminder, dayName }: ReleaseListProps) {
  if (releases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#0A1628] border border-[#1A2744] flex items-center justify-center mb-4">
          <CalendarOff className="w-8 h-8 text-[#8BA3C7]" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Releases</h3>
        <p className="text-[#8BA3C7] text-sm max-w-xs">
          There are no anime scheduled for release on {dayName}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {releases.map((anime) => (
        <AnimeCard
          key={anime.id}
          anime={anime}
          onToggleReminder={onToggleReminder}
        />
      ))}
    </div>
  );
}
