"use client";

import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { periods } from "@/lib/schedule-data";

interface PeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (periodId: string) => void;
}

export function PeriodSelector({ selectedPeriod, onPeriodChange }: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = periods.find(p => p.id === selectedPeriod) || periods[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#0A1628] border border-[#1A2744] rounded-xl text-white font-medium text-sm hover:border-[#A3CFFF] hover:shadow-lg hover:shadow-[#00E5FF]/10 transition-all duration-200 group"
      >
        <span className="text-[#00E5FF]">{current.label}</span>
        {current.current && (
          <span className="px-1.5 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] text-xs font-semibold rounded">
            Current
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-[#A3CFFF] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-[#0A1628] border border-[#1A2744] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
          <div className="p-1.5">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onPeriodChange(p.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  selectedPeriod === p.id
                    ? "bg-[#00E5FF]/10 text-[#00E5FF]"
                    : "text-[#D1D9E6] hover:bg-[#1A2744] hover:text-white"
                }`}
              >
                <span>{p.label}</span>
                {p.current && (
                  <span className="px-1.5 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] text-xs font-semibold rounded">
                    Current
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

