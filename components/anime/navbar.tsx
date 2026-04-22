"use client"

import { Search, Menu, Bell, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#040D1F]/80 backdrop-blur-md border-b border-[#1A2847]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#33CCFF] flex items-center justify-center">
              <span className="text-[#040D1F] font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-white">
              Anime<span className="text-[#00E5FF]">Vista</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-[#D1D9E6] hover:text-[#00E5FF] transition-colors font-medium">
              Home
            </Link>
            <Link href="/browse" className="text-[#D1D9E6] hover:text-[#00E5FF] transition-colors font-medium">
              Browse
            </Link>
            <Link href="/schedule" className="text-[#D1D9E6] hover:text-[#00E5FF] transition-colors font-medium">
              Schedule
            </Link>
            <Link href="/genres" className="text-[#D1D9E6] hover:text-[#00E5FF] transition-colors font-medium">
              Genres
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Button 
              variant="ghost" 
              size="icon"
              className="text-[#A3CFFF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Bookmarks */}
            <Button 
              variant="ghost" 
              size="icon"
              className="text-[#A3CFFF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 hidden sm:flex"
            >
              <Bookmark className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon"
              className="text-[#A3CFFF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 hidden sm:flex relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#00E5FF] rounded-full" />
            </Button>

            {/* Sign In Button */}
            <Button 
              className="bg-[#00E5FF] hover:bg-[#33CCFF] text-[#040D1F] font-semibold px-4 hidden sm:flex"
            >
              Sign In
            </Button>

            {/* Mobile Menu */}
            <Button 
              variant="ghost" 
              size="icon"
              className="text-[#A3CFFF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
