"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, Calendar, User as UserIcon, CheckCircle, List, Shield, Key, Loader2, Check, Save } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { 
  getMe, 
  getMyCollection, 
  updateAge, 
  updatePassword,
  requestOldEmailCode,
  verifyOldEmailCode,
  requestNewEmailCode,
  verifyNewEmailCode,
  type User, 
  type UserCollectionEntry 
} from "@/lib/api"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const { token, user: authUser } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [collection, setCollection] = useState<UserCollectionEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Age form
  const [ageInput, setAgeInput] = useState<string>("")

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: ""
  })

  // Email form (multi-step)
  const [emailStep, setEmailStep] = useState(1) // 1: current, 2: old code, 3: new, 4: new code
  const [emailForm, setEmailForm] = useState({
    current: "",
    oldCode: "",
    new: "",
    newCode: ""
  })

  const fetchData = async () => {
    if (!token) return
    try {
      const [userData, collectionData] = await Promise.all([
        getMe({ token }),
        getMyCollection({ token })
      ])
      setProfile(userData)
      setAgeInput(userData.age?.toString() || "")
      setEmailForm(prev => ({ ...prev, current: userData.email }))
      setCollection(collectionData)
    } catch (e: any) {
      setError(e.message || "Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  const handleUpdateAge = async () => {
    if (!token) return
    const age = parseInt(ageInput)
    if (isNaN(age) || age < 1 || age > 120) {
      setError("Please enter a valid age (1-120)")
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await updateAge({ token, age })
      setSuccessMsg("Age updated successfully!")
      await fetchData()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const validatePassword = (pass: string) => {
    if (pass.length < 10) return "Minimum 10 characters"
    if (!/^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]+$/.test(pass)) return "Only English letters, digits and special characters allowed"
    if (!/[0-9]/.test(pass)) return "Must contain at least 1 digit"
    if (!/[!@#\$%\^\&*\)\(+=._-]/.test(pass)) return "Must contain at least 1 special character"
    if (!/[A-Z]/.test(pass)) return "Must contain at least 1 uppercase letter"
    return null
  }

  const handleUpdatePassword = async () => {
    if (!token) return
    const passError = validatePassword(passwordForm.new)
    if (passError) {
      setError(passError)
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setError("Passwords do not match")
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await updatePassword({ 
        token, 
        current_password: passwordForm.current, 
        new_password: passwordForm.new 
      })
      setSuccessMsg("Password changed successfully!")
      setPasswordForm({ current: "", new: "", confirm: "" })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEmailStep1 = async () => {
    if (!token) return
    setIsSaving(true)
    setError(null)
    try {
      await requestOldEmailCode({ token, email: emailForm.current })
      setEmailStep(2)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEmailStep2 = async () => {
    if (!token) return
    setIsSaving(true)
    setError(null)
    try {
      await verifyOldEmailCode({ token, code: emailForm.oldCode })
      setEmailStep(3)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEmailStep3 = async () => {
    if (!token) return
    setIsSaving(true)
    setError(null)
    try {
      await requestNewEmailCode({ token, email: emailForm.new })
      setEmailStep(4)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEmailStep4 = async () => {
    if (!token) return
    setIsSaving(true)
    setError(null)
    try {
      await verifyNewEmailCode({ token, code: emailForm.newCode })
      setSuccessMsg("Email updated successfully!")
      setEmailStep(1)
      await fetchData()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const watchedCount = collection.filter(item => 
    item.collection_type.name.toLowerCase() === "watched" || 
    item.collection_type.name.toLowerCase() === "completed"
  ).length
  
  const totalInList = collection.length

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!token || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
        <p className="text-foreground-muted mb-6">Please log in to view your profile.</p>
        <Link href="/" className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold">
          Go Home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {(error || successMsg) && (
          <div className={cn(
            "mb-6 p-4 rounded-xl text-sm border flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
            error ? "bg-red-500/10 border-red-500/40 text-red-400" : "bg-green-500/10 border-green-500/40 text-green-400"
          )}>
            {error ? <Shield className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
            <p>{error || successMsg}</p>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-background-secondary/40 p-8 shadow-2xl backdrop-blur-sm mb-12">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex-grow text-center md:text-left w-full">
              <h1 className="text-4xl md:text-5xl font-black text-foreground mb-2 tracking-tight">
                {profile.username}
              </h1>
              <p className="text-foreground-muted flex items-center justify-center md:justify-start gap-2 mb-8">
                <Calendar className="w-4 h-4" />
                <span>Member since: {formatDate(profile.created_at)}</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <div className="flex items-center gap-3 text-foreground-muted bg-background/40 p-4 rounded-2xl border border-border/40">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="text-sm truncate">{profile.email}</span>
                </div>
                {profile.age && (
                  <div className="flex items-center gap-3 text-foreground-muted bg-background/40 p-4 rounded-2xl border border-border/40">
                    <UserIcon className="w-5 h-5 text-primary" />
                    <span className="text-sm">{profile.age} years old</span>
                  </div>
                )}
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 border border-primary/20 p-5 rounded-2xl flex items-center gap-4 group hover:bg-primary/15 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground leading-none">{watchedCount}</div>
                    <div className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mt-1">Watched</div>
                  </div>
                </div>
                <div className="bg-secondary/10 border border-secondary/20 p-5 rounded-2xl flex items-center gap-4 group hover:bg-secondary/15 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                    <List className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground leading-none">{totalInList}</div>
                    <div className="text-[10px] font-bold text-secondary/80 uppercase tracking-widest mt-1">Total List</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Forms Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Email & Age Column */}
          <div className="space-y-8">
            {/* Change Email */}
            <div className="p-8 rounded-3xl border border-border/60 bg-background-secondary/20 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Change Email</h2>
              </div>

              <div className="space-y-4">
                {emailStep === 1 && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Current Email</label>
                      <input 
                        type="email"
                        value={emailForm.current}
                        onChange={(e) => setEmailForm({...emailForm, current: e.target.value})}
                        className="w-full h-12 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
                        placeholder="current@email.com"
                      />
                    </div>
                    <button 
                      onClick={handleEmailStep1}
                      disabled={isSaving}
                      className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Change Email"}
                    </button>
                  </>
                )}

                {emailStep === 2 && (
                  <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-2 mb-4">
                      <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Verification Code (Old Email)</label>
                      <input 
                        type="text"
                        value={emailForm.oldCode}
                        onChange={(e) => setEmailForm({...emailForm, oldCode: e.target.value})}
                        className="w-full h-12 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50 text-center tracking-[0.5em] font-mono"
                        placeholder="000000"
                      />
                    </div>
                    <button 
                      onClick={handleEmailStep2}
                      disabled={isSaving}
                      className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
                    </button>
                  </div>
                )}

                {emailStep === 3 && (
                  <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-2 mb-4">
                      <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">New Email</label>
                      <input 
                        type="email"
                        value={emailForm.new}
                        onChange={(e) => setEmailForm({...emailForm, new: e.target.value})}
                        className="w-full h-12 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50"
                        placeholder="new@email.com"
                      />
                    </div>
                    <button 
                      onClick={handleEmailStep3}
                      disabled={isSaving}
                      className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Get Code"}
                    </button>
                  </div>
                )}

                {emailStep === 4 && (
                  <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-2 mb-4">
                      <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Verification Code (New Email)</label>
                      <input 
                        type="text"
                        value={emailForm.newCode}
                        onChange={(e) => setEmailForm({...emailForm, newCode: e.target.value})}
                        className="w-full h-12 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50 text-center tracking-[0.5em] font-mono"
                        placeholder="000000"
                      />
                    </div>
                    <button 
                      onClick={handleEmailStep4}
                      disabled={isSaving}
                      className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Change"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Set Age */}
            <div className="p-8 rounded-3xl border border-border/60 bg-background-secondary/20 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <UserIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Set Age</h2>
              </div>
              <div className="flex gap-3">
                <input 
                  type="number"
                  min="1"
                  max="120"
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  className="flex-grow h-12 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-secondary/50 transition-colors"
                  placeholder="24"
                />
                <button 
                  onClick={handleUpdateAge}
                  disabled={isSaving}
                  className="px-6 h-12 rounded-xl bg-secondary text-secondary-foreground font-bold hover:bg-secondary/90 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Column */}
          <div className="p-8 rounded-3xl border border-border/60 bg-background-secondary/20 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Change Password</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Current Password</label>
                <input 
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                  className="w-full h-12 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
                  placeholder="••••••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">New Password</label>
                <input 
                  type="password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                  className="w-full h-12 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
                  placeholder="••••••••••••"
                />
                <div className="pt-1 space-y-1">
                  {[
                    { label: "10+ characters", met: passwordForm.new.length >= 10 },
                    { label: "1+ digit", met: /[0-9]/.test(passwordForm.new) },
                    { label: "1+ uppercase", met: /[A-Z]/.test(passwordForm.new) },
                    { label: "1+ special (!@#...)", met: /[!@#\$%\^\&*\)\(+=._-]/.test(passwordForm.new) },
                  ].map((rule, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px]">
                      <div className={cn("w-3 h-3 rounded-full flex items-center justify-center", rule.met ? "bg-green-500" : "bg-border/60")}>
                        {rule.met && <Check className="w-2 h-2 text-white" />}
                      </div>
                      <span className={rule.met ? "text-green-400" : "text-foreground-muted"}>{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Confirm New Password</label>
                <input 
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                  className="w-full h-12 rounded-xl bg-background border border-border/60 px-4 text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
                  placeholder="••••••••••••"
                />
              </div>
              <button 
                onClick={handleUpdatePassword}
                disabled={isSaving}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
