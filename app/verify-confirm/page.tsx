"use client"

import Link from "next/link"
import { CheckCircle2, Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function VerifyConfirmPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Background gradient - celebratory */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(0, 229, 255, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(0, 200, 255, 0.05) 0%, transparent 40%)",
        }}
      />
      
      {/* Decorative watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25rem] font-bold text-secondary/[0.02] select-none pointer-events-none leading-none tracking-tighter">
        AV
      </div>

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float-particle ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Scan-line animation overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
          animation: "scanline 8s linear infinite",
        }}
      />
      <style jsx>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
        }
        @keyframes success-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
      `}</style>

      {/* Card */}
      <div className="relative w-full max-w-md">
        {/* Gradient border effect - more vibrant for success */}
        <div className="absolute -inset-[1px] bg-gradient-to-br from-primary/60 via-secondary/30 to-primary/20 rounded-2xl pointer-events-none" />
        
        <div 
          className="relative backdrop-blur-xl rounded-2xl p-8 sm:p-10"
          style={{
            backgroundColor: "rgba(8, 18, 41, 0.85)",
            border: "1px solid rgba(163, 207, 255, 0.3)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.1), 0 0 60px -15px rgba(0, 229, 255, 0.2)",
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-2xl">A</span>
                </div>
                <div className="absolute inset-0 rounded-xl bg-primary/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-3xl font-bold tracking-tight">
                <span className="text-foreground">Anime</span>
                <span className="text-primary">Vista</span>
              </span>
            </Link>
          </div>

          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div 
              className="relative w-28 h-28"
              style={{ animation: "success-bounce 2s ease-in-out infinite" }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl" />
              
              {/* Main circle */}
              <div className="relative w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,229,255,0.4)]">
                <CheckCircle2 className="w-14 h-14 text-primary-foreground" />
              </div>
              
              {/* Sparkles */}
              <Sparkles 
                className="absolute -top-2 -right-2 w-6 h-6 text-primary" 
                style={{ animation: "sparkle 2s ease-in-out infinite" }}
              />
              <Sparkles 
                className="absolute -bottom-1 -left-3 w-5 h-5 text-secondary" 
                style={{ animation: "sparkle 2s ease-in-out infinite 0.5s" }}
              />
              <Sparkles 
                className="absolute top-1/2 -right-4 w-4 h-4 text-primary/70" 
                style={{ animation: "sparkle 2s ease-in-out infinite 1s" }}
              />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full mb-3">
              {t.verifyConfirm.subtitle}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{t.verifyConfirm.title}</h1>
            <p className="text-foreground-muted text-sm leading-relaxed">
              {t.verifyConfirm.message}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <Link
              href="/profile"
              className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {t.verifyConfirm.goToDashboard}
            </Link>
            
            <div className="flex items-center justify-center gap-3 text-sm text-foreground-muted">
              <span>{t.verifyConfirm.orLogin}</span>
              <Link 
                href="/login" 
                className="text-primary font-medium hover:underline transition-all duration-300 hover:text-primary/80 hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]"
              >
                {t.verifyConfirm.login}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
