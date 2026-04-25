"use client";

import { DaySchedule } from "@/lib/schedule-data";

interface DayTabsProps {
  schedule: DaySchedule[];
  selectedDay: string;
  onDayChange: (day: string) => void;
}

export function DayTabs({ schedule, selectedDay, onDayChange }: DayTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {schedule.map((day) => {
        const isSelected = selectedDay === day.day;
        const isToday = day.isToday;
        
        return (
          <button
            key={day.day}
            onClick={() => onDayChange(day.day)}
            className={`relative flex flex-col items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 min-w-[80px] group ${
              isSelected
                ? "bg-[#00E5FF] text-[#040D1F] shadow-lg shadow-[#00E5FF]/30"
                : "bg-[#0A1628] border border-[#1A2744] text-[#D1D9E6] hover:border-[#A3CFFF] hover:text-white hover:shadow-lg hover:shadow-[#00E5FF]/10"
            }`}
          >
            {isToday && !isSelected && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00E5FF] rounded-full animate-pulse" />
            )}
            <span className={`font-bold ${isSelected ? "text-[#040D1F]" : "text-white"}`}>
              {day.shortDay}
            </span>
            <span className={`text-xs mt-0.5 ${isSelected ? "text-[#040D1F]/70" : "text-[#8BA3C7]"}`}>
              {day.date}
            </span>
            {isToday && (
              <span className={`text-[10px] font-semibold mt-1 ${isSelected ? "text-[#040D1F]/80" : "text-[#00E5FF]"}`}>
                TODAY
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
