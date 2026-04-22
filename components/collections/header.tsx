"use client"

import { Search, Bell, Menu } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#040D1F]/80 border-b border-[rgba(163,207,255,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#33CCFF] flex items-center justify-center
              shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              <span className="text-xl font-bold text-[#040D1F]">A</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00E5FF] rounded-full animate-pulse" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Anime<span className="text-[#00E5FF]">Vista</span>
            </span>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {["Home", "Browse", "Collections", "Schedule", "My List"].map((item) => (
              <a
                key={item}
                href="#"
                className={`text-sm font-medium transition-colors duration-300
                  ${item === "Collections" 
                    ? "text-[#00E5FF]" 
                    : "text-[#D1D9E6] hover:text-[#00E5FF]"
                  }`}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button className="p-2.5 rounded-lg bg-[#0A1832] border border-[rgba(163,207,255,0.15)]
              transition-all duration-300 hover:border-[#00E5FF]/50 hover:shadow-[0_0_15px_rgba(0,229,255,0.15)]">
              <Search className="w-5 h-5 text-[#A3CFFF]" />
            </button>
            
            {/* Notifications */}
            <button className="relative p-2.5 rounded-lg bg-[#0A1832] border border-[rgba(163,207,255,0.15)]
              transition-all duration-300 hover:border-[#00E5FF]/50 hover:shadow-[0_0_15px_rgba(0,229,255,0.15)]">
              <Bell className="w-5 h-5 text-[#A3CFFF]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#00E5FF] rounded-full" />
            </button>

            {/* Mobile Menu */}
            <button className="md:hidden p-2.5 rounded-lg bg-[#0A1832] border border-[rgba(163,207,255,0.15)]">
              <Menu className="w-5 h-5 text-[#A3CFFF]" />
            </button>

            {/* Sign In - Desktop */}
            <button className="hidden md:flex items-center px-5 py-2.5 rounded-lg 
              bg-[#00E5FF] text-[#040D1F] font-semibold text-sm
              transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:scale-105">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
