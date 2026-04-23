"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, User, Mail, Lock, ShieldCheck, Eye, EyeOff, Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function RegisterPage() {
  const { t } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle registration logic here
    console.log("Registration submitted:", formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 80% 80%, rgba(0, 229, 255, 0.08) 0%, transparent 50%)",
        }}
      />
      
      {/* Decorative watermark */}
      <div className="absolute bottom-0 right-0 text-[20rem] font-bold text-secondary/[0.03] select-none pointer-events-none leading-none tracking-tighter">
        AV
      </div>

      {/* Scan-line overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />

      {/* Back to Home */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-foreground-muted hover:text-primary transition-colors duration-300 group z-10"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="text-sm font-medium">{t.register.backToHome}</span>
      </Link>

      {/* Registration Card */}
      <div className="relative w-full max-w-md">
        {/* Gradient border effect */}
        <div className="absolute -inset-[1px] bg-gradient-to-br from-primary/50 via-transparent to-transparent rounded-2xl pointer-events-none" />
        
        <div 
          className="relative backdrop-blur-md bg-card/80 rounded-2xl p-8 sm:p-10"
          style={{
            border: "1px solid rgba(163, 207, 255, 0.2)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">A</span>
                </div>
                <div className="absolute inset-0 rounded-xl bg-primary/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-foreground">Anime</span>
                <span className="text-primary">Vista</span>
              </span>
            </Link>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{t.register.joinTheVista}</h1>
            <p className="text-foreground-muted text-sm">{t.register.createAccountStart}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-foreground-muted">
                {t.register.username}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <User className={`w-5 h-5 transition-colors duration-300 ${focusedField === "username" ? "text-primary" : "text-secondary/60"}`} />
                </div>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  placeholder={t.register.enterUsername}
                  className="w-full h-12 pl-12 pr-4 bg-background-secondary border border-secondary/30 rounded-xl text-foreground placeholder:text-foreground-muted/50 transition-all duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  style={{
                    boxShadow: focusedField === "username" ? "0 0 20px rgba(0, 229, 255, 0.2)" : "none",
                  }}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground-muted">
                {t.register.emailAddress}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail className={`w-5 h-5 transition-colors duration-300 ${focusedField === "email" ? "text-primary" : "text-secondary/60"}`} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder={t.register.enterEmail}
                  className="w-full h-12 pl-12 pr-4 bg-background-secondary border border-secondary/30 rounded-xl text-foreground placeholder:text-foreground-muted/50 transition-all duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  style={{
                    boxShadow: focusedField === "email" ? "0 0 20px rgba(0, 229, 255, 0.2)" : "none",
                  }}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground-muted">
                {t.register.password}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className={`w-5 h-5 transition-colors duration-300 ${focusedField === "password" ? "text-primary" : "text-secondary/60"}`} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder={t.register.createPassword}
                  className="w-full h-12 pl-12 pr-12 bg-background-secondary border border-secondary/30 rounded-xl text-foreground placeholder:text-foreground-muted/50 transition-all duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  style={{
                    boxShadow: focusedField === "password" ? "0 0 20px rgba(0, 229, 255, 0.2)" : "none",
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-primary transition-colors duration-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground-muted">
                {t.register.confirmPassword}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ShieldCheck className={`w-5 h-5 transition-colors duration-300 ${focusedField === "confirmPassword" ? "text-primary" : "text-secondary/60"}`} />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField(null)}
                  placeholder={t.register.confirmYourPassword}
                  className="w-full h-12 pl-12 pr-12 bg-background-secondary border border-secondary/30 rounded-xl text-foreground placeholder:text-foreground-muted/50 transition-all duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  style={{
                    boxShadow: focusedField === "confirmPassword" ? "0 0 20px rgba(0, 229, 255, 0.2)" : "none",
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-primary transition-colors duration-300"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  agreedToTerms 
                    ? "bg-primary border-primary" 
                    : "border-secondary/50 hover:border-primary/50"
                }`}
                aria-label={t.register.agreeToTerms}
              >
                {agreedToTerms && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
              </button>
              <label className="text-sm text-foreground-muted leading-relaxed cursor-pointer" onClick={() => setAgreedToTerms(!agreedToTerms)}>
                {t.register.agreeToTerms}{" "}
                <Link href="/terms" className="text-primary hover:underline hover:text-primary/80 transition-colors">
                  {t.register.termsOfService}
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!agreedToTerms}
              className="w-full h-12 mt-6 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {t.register.createAccount}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-foreground-muted text-sm">
            {t.register.alreadyMember}{" "}
            <Link 
              href="/login" 
              className="text-primary font-medium hover:underline transition-all duration-300 hover:text-primary/80 hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]"
            >
              {t.register.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
