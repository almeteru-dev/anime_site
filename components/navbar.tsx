"use client"

import { useState, useEffect } from "react"
import { Search, X, Sun, Moon, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove("light")
    } else {
      document.documentElement.classList.add("light")
    }
  }, [isDarkMode])

  const navLinks = [
    { label: t.nav.catalog, href: "/catalog" },
    { label: t.nav.collections, href: "/collections" },
    { label: t.nav.schedule, href: "/schedule" },
  ]

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl lg:text-2xl font-bold tracking-tight">
              <span className="text-foreground">Anime</span>
              <span className="text-primary">Vista</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-foreground-muted hover:text-primary transition-colors duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Search */}
            <div className="relative">
              <div
                className={cn(
                  "flex items-center transition-all duration-300 overflow-hidden",
                  isSearchOpen ? "w-48 lg:w-64" : "w-10"
                )}
              >
                {isSearchOpen && (
                  <input
                    type="text"
                    placeholder={t.nav.searchPlaceholder}
                    autoFocus
                    className="w-full h-10 pl-4 pr-10 bg-muted border border-border rounded-full text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                )}
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200",
                    isSearchOpen
                      ? "absolute right-0 hover:bg-transparent"
                      : "hover:bg-muted"
                  )}
                  aria-label={isSearchOpen ? "Close search" : "Open search"}
                >
                  {isSearchOpen ? (
                    <X className="w-5 h-5 text-foreground-muted" />
                  ) : (
                    <Search className="w-5 h-5 text-foreground-muted hover:text-primary transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-foreground-muted hover:text-primary transition-colors" />
              ) : (
                <Moon className="w-5 h-5 text-foreground-muted hover:text-primary transition-colors" />
              )}
            </button>

            {/* Language Switcher - Desktop */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* Sign In Button - Desktop */}
            <Link
              href="/login"
              className="hidden md:flex items-center justify-center px-5 py-2 bg-primary text-primary-foreground font-medium rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:scale-105"
            >
              {t.nav.signIn}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-5 h-5 text-foreground-muted" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-foreground-muted hover:text-primary transition-colors duration-200 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Mobile Language Switcher */}
              <div className="border-t border-border pt-4 mt-2">
                <LanguageSwitcher variant="mobile" />
              </div>
              
              <Link
                href="/login"
                className="flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.nav.signIn}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
