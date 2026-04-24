"use client";

import { Clock, Play, Zap } from "lucide-react";
import { getNextRelease } from "@/lib/schedule-data";
import Image from "next/image";

export function NextRelease() {
  const nextRelease = getNextRelease();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1628] to-[#081229] border border-[#1A2744] p-6">
      {/* Decorative glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00E5FF]/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#33CCFF]/5 rounded-full blur-2xl" />
      
      {/* Header */}
      <div className="relative flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00E5FF]/10">
          <Zap className="w-4 h-4 text-[#00E5FF]" />
        </div>
        <h2 className="text-lg font-bold text-white">Next to Release</h2>
      </div>

      {/* Content */}
      <div className="relative flex gap-4">
        {/* Poster */}
        <div className="relative w-24 h-36 rounded-xl overflow-hidden flex-shrink-0 shadow-xl shadow-black/40 ring-1 ring-[#00E5FF]/20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A2744] to-[#0A1628]" />
          <Image
            src={nextRelease.posterUrl}
            alt={nextRelease.title}
            fill
            className="object-cover"
            sizes="96px"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Inner shadow */}
          <div className="absolute inset-0 shadow-[inset_0_2px_12px_rgba(0,0,0,0.5),inset_0_-2px_4px_rgba(163,207,255,0.1)]" />
          
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[#00E5FF] flex items-center justify-center shadow-lg shadow-[#00E5FF]/40">
              <Play className="w-5 h-5 text-[#040D1F] ml-0.5" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <h3 className="font-bold text-white text-lg leading-snug mb-1">
              {nextRelease.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] text-xs font-semibold rounded-md">
                Ep. {nextRelease.episode}
              </span>
              <span className="text-[#8BA3C7] text-xs">{nextRelease.day}</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-xl">
              <Clock className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-[#00E5FF] font-bold text-lg tracking-wide">
                {nextRelease.countdown}
              </span>
            </div>
            <span className="text-[#8BA3C7] text-sm">until release</span>
          </div>
        </div>
      </div>
    </div>
  );
}
