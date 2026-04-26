"use client";

import { Bell, BellRing, Clock } from "lucide-react";
import { AnimeRelease } from "@/lib/schedule-data";
import Image from "next/image";
import Link from "next/link";

interface AnimeCardProps {
  anime: AnimeRelease;
  onToggleReminder: (id: string) => void;
}

export function AnimeCard({ anime, onToggleReminder }: AnimeCardProps) {
  return (
    <div className="group relative flex items-center gap-4 p-4 bg-[#0A1628] border border-[#1A2744] rounded-xl transition-all duration-300 hover:border-[#00E5FF]/50 hover:shadow-xl hover:shadow-[#00E5FF]/10 hover:bg-[#0D1A30]">
      {/* Time */}
      <div className="flex flex-col items-center justify-center min-w-[72px] py-2 px-3 bg-[#081229] rounded-lg border border-[#1A2744]">
        <Clock className="w-3.5 h-3.5 text-[#00E5FF] mb-1" />
        <span className="text-[#00E5FF] font-bold text-sm tracking-wide">
          {anime.time}
        </span>
      </div>

      {/* Poster */}
      <Link href="/catalog" className="relative w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-lg shadow-black/30 ring-1 ring-[#1A2744] group-hover:ring-[#00E5FF]/30 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2744] to-[#0A1628]" />
        <Image
          src={anime.posterUrl}
          alt={anime.title}
          fill
          className="object-cover"
          sizes="56px"
          onError={(e) => {
            // Fallback handled by the gradient background
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Premium 3D inner shadow effect */}
        <div className="absolute inset-0 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4),inset_0_-1px_2px_rgba(163,207,255,0.1)]" />
      </Link>

      {/* Info */}
      <Link href="/catalog" className="flex-1 min-w-0">
        <h3 className="font-bold text-white text-base leading-snug truncate group-hover:text-[#00E5FF] transition-colors duration-200">
          {anime.title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="inline-flex items-center px-2 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] text-xs font-semibold rounded-md">
            Ep. {anime.episode}
          </span>
          <span className="text-[#8BA3C7] text-xs">New Episode</span>
        </div>
      </Link>

      {/* Remind Button */}
      <button
        onClick={() => onToggleReminder(anime.id)}
        className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
          anime.isReminded
            ? "bg-[#00E5FF]/15 text-[#00E5FF] shadow-lg shadow-[#00E5FF]/20"
            : "bg-[#1A2744] text-[#8BA3C7] hover:bg-[#00E5FF]/10 hover:text-[#00E5FF]"
        }`}
        aria-label={anime.isReminded ? "Remove reminder" : "Set reminder"}
      >
        {anime.isReminded ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {anime.isReminded && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00E5FF] rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
}
