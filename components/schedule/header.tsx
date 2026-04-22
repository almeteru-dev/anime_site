"use client";

import { Calendar } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#33CCFF] flex items-center justify-center shadow-lg shadow-[#00E5FF]/20">
                <span className="text-[#040D1F] font-bold text-lg">A</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                AnimeVista
              </h1>
              <p className="text-xs text-[#8BA3C7] -mt-0.5">Release Schedule</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-[#A3CFFF] hover:text-[#00E5FF] transition-colors text-sm font-medium">
              Home
            </a>
            <a href="#" className="text-[#00E5FF] text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </a>
            <a href="#" className="text-[#A3CFFF] hover:text-[#00E5FF] transition-colors text-sm font-medium">
              Browse
            </a>
            <a href="#" className="text-[#A3CFFF] hover:text-[#00E5FF] transition-colors text-sm font-medium">
              My List
            </a>
          </nav>

          {/* CTA */}
          <button className="px-4 py-2 bg-[#00E5FF] text-[#040D1F] font-semibold text-sm rounded-lg hover:bg-[#33CCFF] transition-all duration-200 hover:shadow-lg hover:shadow-[#00E5FF]/30">
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
}
