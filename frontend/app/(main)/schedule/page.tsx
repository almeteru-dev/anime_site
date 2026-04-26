"use client";

import { useState, useCallback } from "react";
import { PeriodSelector } from "@/components/schedule/period-selector";
import { DayTabs } from "@/components/schedule/day-tabs";
import { ReleaseList } from "@/components/schedule/release-list";
import { NextRelease } from "@/components/schedule/next-release";
import { weekSchedule, DaySchedule } from "@/lib/schedule-data";
import { CalendarDays } from "lucide-react";

export default function ReleasesPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("2026-04");
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = weekSchedule.find(d => d.isToday);
    return today?.day || weekSchedule[0].day;
  });
  const [schedule, setSchedule] = useState<DaySchedule[]>(weekSchedule);

  const currentDaySchedule = schedule.find(d => d.day === selectedDay);

  const handleToggleReminder = useCallback((animeId: string) => {
    setSchedule(prev => 
      prev.map(day => ({
        ...day,
        releases: day.releases.map(anime => 
          anime.id === animeId 
            ? { ...anime, isReminded: !anime.isReminded }
            : anime
        )
      }))
    );
  }, []);

  const remindedCount = schedule.reduce(
    (acc, day) => acc + day.releases.filter(r => r.isReminded).length, 
    0
  );

  return (
    <div className="pt-20">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#00E5FF]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#33CCFF]/3 rounded-full blur-[100px]" />
      </div>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20">
                <CalendarDays className="w-5 h-5 text-[#00E5FF]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white text-balance">
                Release Schedule
              </h1>
            </div>
            <p className="text-[#8BA3C7] text-sm sm:text-base">
              Track upcoming episodes and never miss your favorite anime.
              <span className="ml-2 text-[#00E5FF] font-medium">
                {remindedCount} reminder{remindedCount !== 1 ? 's' : ''} set
              </span>
            </p>
          </div>
          <PeriodSelector 
            selectedPeriod={selectedPeriod} 
            onPeriodChange={setSelectedPeriod} 
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedule Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Day Tabs */}
            <DayTabs 
              schedule={schedule}
              selectedDay={selectedDay}
              onDayChange={setSelectedDay}
            />

            {/* Day Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {currentDaySchedule?.day}
                  {currentDaySchedule?.isToday && (
                    <span className="ml-2 px-2 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] text-xs font-semibold rounded-lg">
                      Today
                    </span>
                  )}
                </h2>
                <p className="text-[#8BA3C7] text-sm mt-0.5">
                  {currentDaySchedule?.releases.length || 0} release{(currentDaySchedule?.releases.length || 0) !== 1 ? 's' : ''} scheduled
                </p>
              </div>
              <span className="text-[#A3CFFF] text-sm font-medium">
                {currentDaySchedule?.date}, 2026
              </span>
            </div>

            {/* Release List */}
            {currentDaySchedule && (
              <ReleaseList
                releases={currentDaySchedule.releases}
                onToggleReminder={handleToggleReminder}
                dayName={currentDaySchedule.day}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <NextRelease />

            {/* Stats Card */}
            <div className="rounded-2xl bg-[#0A1628] border border-[#1A2744] p-6">
              <h3 className="text-base font-semibold text-white mb-4">This Week</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#081229] rounded-xl border border-[#1A2744]">
                  <span className="text-2xl font-bold text-[#00E5FF]">
                    {schedule.reduce((acc, day) => acc + day.releases.length, 0)}
                  </span>
                  <p className="text-[#8BA3C7] text-xs mt-1">Total Episodes</p>
                </div>
                <div className="p-3 bg-[#081229] rounded-xl border border-[#1A2744]">
                  <span className="text-2xl font-bold text-[#A3CFFF]">
                    {remindedCount}
                  </span>
                  <p className="text-[#8BA3C7] text-xs mt-1">Reminders Set</p>
                </div>
              </div>
            </div>

            {/* Timezone Notice */}
            <div className="rounded-xl bg-[#081229]/50 border border-[#1A2744]/50 p-4">
              <p className="text-[#8BA3C7] text-xs leading-relaxed">
                All times shown in <span className="text-[#A3CFFF] font-medium">PST (UTC-8)</span>. 
                Adjust for your local timezone.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
