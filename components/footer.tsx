"use client"

import { MessageCircle, Send } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Logo & Tagline */}
          <div className="text-center lg:text-left">
            <a href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-foreground">Anime</span>
                <span className="text-primary">Vista</span>
              </span>
            </a>
            <p className="text-foreground-muted text-sm mt-2">
              Your gateway to endless anime adventures
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 lg:gap-8">
            <a
              href="#terms"
              className="text-foreground-muted hover:text-primary transition-colors text-sm"
            >
              Terms of Service
            </a>
            <a
              href="#dmca"
              className="text-foreground-muted hover:text-primary transition-colors text-sm"
            >
              DMCA
            </a>
            <a
              href="#contact"
              className="text-foreground-muted hover:text-primary transition-colors text-sm"
            >
              Contact
            </a>
            <a
              href="#faq"
              className="text-foreground-muted hover:text-primary transition-colors text-sm"
            >
              FAQ
            </a>
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="#telegram"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-primary/20 hover:border-primary border border-transparent transition-all duration-200 group"
              aria-label="Telegram"
            >
              <Send className="w-4 h-4 text-foreground-muted group-hover:text-primary transition-colors" />
            </a>
            <a
              href="#discord"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-primary/20 hover:border-primary border border-transparent transition-all duration-200 group"
              aria-label="Discord"
            >
              <MessageCircle className="w-4 h-4 text-foreground-muted group-hover:text-primary transition-colors" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-foreground-muted text-sm">
            © {new Date().getFullYear()} AnimeVista. All rights reserved.
          </p>
          <p className="text-foreground-muted/60 text-xs mt-2">
            AnimeVista does not store any files on its servers. All content is provided by non-affiliated third parties.
          </p>
        </div>
      </div>
    </footer>
  )
}
