"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  Play,
  Clock,
  Tv,
  Heart,
  XCircle,
  Pencil,
  Hash,
  Send
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { UserCollectionCard } from "@/components/user-collection-card"
import type { AnimeStatus } from "@/components/anime-status-manager"

// Mock user data
const mockUser = {
  id: "1",
  nickname: "AnimeKing",
  email: "animeking@example.com",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
  age: 24,
  gender: "male" as const,
  registrationDate: "January 2024",
}

// Initial anime collection data with status
interface AnimeItem {
  id: string
  title: string
  image: string
  rating: number
  episodes: number
  currentEpisode?: number
  status: AnimeStatus
}

const initialAnimeCollection: AnimeItem[] = [
  { id: "1", title: "Demon Slayer", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=400&fit=crop", rating: 9.2, episodes: 26, status: "watched" },
  { id: "2", title: "Jujutsu Kaisen", image: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=300&h=400&fit=crop", rating: 9.0, episodes: 24, status: "watched" },
  { id: "3", title: "Attack on Titan", image: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=300&h=400&fit=crop", rating: 9.5, episodes: 87, status: "watched" },
  { id: "4", title: "Solo Leveling", image: "https://images.unsplash.com/photo-1560972550-aba3456b5564?w=300&h=400&fit=crop", rating: 8.8, episodes: 12, status: "planned" },
  { id: "5", title: "Chainsaw Man", image: "https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=300&h=400&fit=crop", rating: 8.9, episodes: 12, status: "planned" },
  { id: "6", title: "One Piece", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&h=400&fit=crop", rating: 8.7, episodes: 1100, status: "dropped" },
  { id: "7", title: "Spy x Family", image: "https://images.unsplash.com/photo-1614583225154-5fcdda07019e?w=300&h=400&fit=crop", rating: 8.6, episodes: 25, currentEpisode: 15, status: "inProgress" },
  { id: "8", title: "My Hero Academia", image: "https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=300&h=400&fit=crop", rating: 8.4, episodes: 138, currentEpisode: 89, status: "inProgress" },
]

type CollectionTab = "watched" | "planned" | "dropped" | "inProgress"

export default function ProfilePage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<CollectionTab>("watched")
  const [animeCollection, setAnimeCollection] = useState<AnimeItem[]>(initialAnimeCollection)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [profileData, setProfileData] = useState({
    age: mockUser.age,
    newEmail: "",
    verificationCode: "",
  })
  const [isEmailVerificationSent, setIsEmailVerificationSent] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Handle status change - sends PATCH request to backend
  const handleStatusChange = async (animeId: string, newStatus: AnimeStatus) => {
    // Simulate API call: PATCH /api/user/anime/{animeId}/status
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setAnimeCollection(prev => 
      prev.map(anime => 
        anime.id === animeId ? { ...anime, status: newStatus } : anime
      )
    )
  }

  // Handle remove from collection - sends DELETE request to backend
  const handleRemove = async (animeId: string) => {
    // Simulate API call: DELETE /api/user/anime/{animeId}
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setAnimeCollection(prev => prev.filter(anime => anime.id !== animeId))
  }

  // Send verification code to new email
  const handleSendVerificationCode = async () => {
    if (!profileData.newEmail) return
    // Simulate API call: POST /api/user/email/send-verification
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsEmailVerificationSent(true)
    // Reset after 60 seconds
    setTimeout(() => setIsEmailVerificationSent(false), 60000)
  }

  /**
   * Handle form submission - sends all profile data to Go backend
   * API: PATCH /api/user/profile
   * Request body structure for Go backend:
   * {
   *   age?: number,
   *   newEmail?: string,
   *   emailVerificationCode?: string,
   *   currentPassword?: string,
   *   newPassword?: string,
   *   confirmPassword?: string
   * }
   */
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    
    // Prepare data for Go backend API
    const updatePayload = {
      // Profile fields
      age: profileData.age,
      // Email change (only if new email is provided)
      ...(profileData.newEmail && {
        newEmail: profileData.newEmail,
        emailVerificationCode: profileData.verificationCode,
      }),
      // Password change (only if password fields are filled)
      ...(passwordData.currentPassword && {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      }),
    }
    
    // Simulate API call: PATCH /api/user/profile
    console.log("[API] Sending profile update:", updatePayload)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Reset form fields after successful update
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setProfileData(prev => ({ ...prev, newEmail: "", verificationCode: "" }))
    setIsEmailVerificationSent(false)
    setIsUpdating(false)
  }

  // Get collections grouped by status
  const getCollectionsByStatus = (status: CollectionTab) => 
    animeCollection.filter(anime => anime.status === status)

  const tabs = [
    { id: "watched" as const, label: t.profile.watched, icon: Check, count: getCollectionsByStatus("watched").length },
    { id: "planned" as const, label: t.profile.planned, icon: Clock, count: getCollectionsByStatus("planned").length },
    { id: "dropped" as const, label: t.profile.dropped, icon: XCircle, count: getCollectionsByStatus("dropped").length },
    { id: "inProgress" as const, label: t.profile.inProgress, icon: Play, count: getCollectionsByStatus("inProgress").length },
  ]

  const currentCollection = getCollectionsByStatus(activeTab)

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case "male": return t.profile.male
      case "female": return t.profile.female
      default: return t.profile.other
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(0, 229, 255, 0.05) 0%, transparent 50%)",
        }}
      />
      
      {/* Decorative watermark */}
      <div className="absolute top-1/4 right-0 text-[20rem] font-bold text-secondary/[0.02] select-none pointer-events-none leading-none tracking-tighter">
        AV
      </div>

      {/* Back to Home */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-foreground-muted hover:text-primary transition-colors duration-300 group z-10"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="text-sm font-medium">{t.login.backToHome}</span>
      </Link>

      <div className="container mx-auto px-4 py-20 max-w-6xl">
        {/* User Info Header */}
        <section className="relative mb-12">
          <div className="absolute -inset-[1px] bg-gradient-to-b from-primary/40 via-transparent to-transparent rounded-2xl pointer-events-none" />
          <div 
            className="relative backdrop-blur-xl rounded-2xl p-6 sm:p-8"
            style={{
              backgroundColor: "rgba(8, 18, 41, 0.8)",
              border: "1px solid rgba(163, 207, 255, 0.2)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden ring-4 ring-primary/30 shadow-[var(--glow-primary)] transition-all duration-300 group-hover:ring-primary/50">
                  <Image
                    src={mockUser.avatar}
                    alt={mockUser.nickname}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                </div>
                <button 
                  className="absolute bottom-2 right-2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  aria-label={t.profile.editProfile}
                >
                  <Pencil className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>

              {/* User Details */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {mockUser.nickname}
                </h1>
                <p className="text-foreground-muted text-sm mb-4">
                  {t.profile.memberSince}: {mockUser.registrationDate}
                </p>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-foreground-muted truncate">{mockUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-foreground-muted">{profileData.age} {t.profile.years}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-foreground-muted">
                      {getCollectionsByStatus("watched").length} {t.profile.animeWatched}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Tv className="w-4 h-4 text-primary" />
                    <span className="text-foreground-muted">
                      {animeCollection.length} {t.profile.totalInList}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Anime Collections */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Heart className="w-6 h-6 text-primary" />
            {t.profile.collections}
          </h2>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-[var(--glow-primary)]"
                      : "bg-card border border-card-border text-foreground-muted hover:text-foreground hover:border-primary/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs",
                    activeTab === tab.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Collection Grid */}
          <div 
            className="relative rounded-2xl p-6"
            style={{
              backgroundColor: "rgba(8, 18, 41, 0.6)",
              border: "1px solid rgba(163, 207, 255, 0.15)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            {currentCollection.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {currentCollection.map((anime) => (
                  <UserCollectionCard
                    key={anime.id}
                    id={anime.id}
                    title={anime.title}
                    image={anime.image}
                    rating={anime.rating}
                    episodes={anime.episodes}
                    currentEpisode={anime.currentEpisode}
                    status={anime.status}
                    showDelete={true}
                    onStatusChange={handleStatusChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Tv className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t.profile.noAnimeInCollection}
                </h3>
                <p className="text-foreground-muted text-sm mb-6 max-w-sm">
                  {t.profile.startWatching}
                </p>
                <Link
                  href="/catalog"
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:scale-[1.02]"
                >
                  {t.profile.browseAnime}
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Profile & Security Settings */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            {t.profile.profileSettings}
          </h2>

          <div className="relative">
            <div className="absolute -inset-[1px] bg-gradient-to-br from-primary/30 via-transparent to-transparent rounded-2xl pointer-events-none" />
            <div 
              className="relative backdrop-blur-xl rounded-2xl p-6 sm:p-8"
              style={{
                backgroundColor: "rgba(8, 18, 41, 0.8)",
                border: "1px solid rgba(163, 207, 255, 0.2)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <form onSubmit={handleProfileUpdate} className="space-y-8">
                {/* Profile Settings Section */}
                <div className="space-y-5 max-w-md">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    {t.profile.editProfile}
                  </h3>

                  {/* Age Input */}
                  <div className="space-y-2">
                    <label htmlFor="age" className="block text-sm font-medium text-foreground-muted">
                      {t.profile.editAge}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Calendar className={cn(
                          "w-5 h-5 transition-colors duration-300",
                          focusedField === "age" ? "text-primary" : "text-secondary/60"
                        )} />
                      </div>
                      <input
                        id="age"
                        type="number"
                        min="0"
                        max="150"
                        value={profileData.age}
                        onChange={(e) => setProfileData(prev => ({ ...prev, age: Math.max(0, parseInt(e.target.value) || 0) }))}
                        onFocus={() => setFocusedField("age")}
                        onBlur={() => setFocusedField(null)}
                        placeholder={t.profile.enterAge}
                        className="w-full h-12 pl-12 pr-4 bg-background border border-secondary/30 rounded-xl text-foreground placeholder:text-foreground-muted/50 transition-all duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                        style={{
                          boxShadow: focusedField === "age" ? "0 0 20px rgba(0, 229, 255, 0.2)" : "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* New Email Input */}
                  <div className="space-y-2">
                    <label htmlFor="newEmail" className="block text-sm font-medium text-foreground-muted">
                      {t.profile.newEmailAddress}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Mail className={cn(
                          "w-5 h-5 transition-colors duration-300",
                          focusedField === "newEmail" ? "text-primary" : "text-secondary/60"
                        )} />
                      </div>
                      <input
                        id="newEmail"
                        type="email"
                        value={profileData.newEmail}
                        onChange={(e) => {
                          setProfileData(prev => ({ ...prev, newEmail: e.target.value }))
                          if (isEmailVerificationSent) setIsEmailVerificationSent(false)
                        }}
                        onFocus={() => setFocusedField("newEmail")}
                        onBlur={() => setFocusedField(null)}
                        placeholder={t.profile.enterNewEmail}
                        className="w-full h-12 pl-12 pr-28 bg-background border border-secondary/30 rounded-xl text-foreground placeholder:text-foreground-muted/50 transition-all duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                        style={{
                          boxShadow: focusedField === "newEmail" ? "0 0 20px rgba(0, 229, 255, 0.2)" : "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        disabled={!profileData.newEmail || isEmailVerificationSent}
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 flex items-center gap-1.5",
                          isEmailVerificationSent 
                            ? "bg-emerald-500/20 text-emerald-400 cursor-default"
                            : profileData.newEmail
                              ? "bg-primary/20 text-primary hover:bg-primary/30"
                              : "bg-secondary/10 text-secondary/40 cursor-not-allowed"
                        )}
                      >
                        {isEmailVerificationSent ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            {t.profile.codeSent}
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            {t.profile.sendVerificationCode}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Verification Code Input - Only visible when new email is entered */}
                  <div className={cn(
                    "space-y-2 transition-all duration-300",
                    profileData.newEmail ? "opacity-100" : "opacity-40 pointer-events-none"
                  )}>
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-foreground-muted">
                      {t.profile.verificationCode}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Hash className={cn(
                          "w-5 h-5 transition-colors duration-300",
                          focusedField === "verificationCode" ? "text-primary" : "text-secondary/60"
                        )} />
                      </div>
                      <input
                        id="verificationCode"
                        type="text"
                        value={profileData.verificationCode}
                        onChange={(e) => setProfileData(prev => ({ ...prev, verificationCode: e.target.value }))}
                        onFocus={() => setFocusedField("verificationCode")}
                        onBlur={() => setFocusedField(null)}
                        placeholder={t.profile.enterVerificationCode}
                        disabled={!profileData.newEmail}
                        className="w-full h-12 pl-12 pr-4 bg-background border border-secondary/30 rounded-xl text-foreground placeholder:text-foreground-muted/50 transition-all duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                        style={{
                          boxShadow: focusedField === "verificationCode" ? "0 0 20px rgba(0, 229, 255, 0.2)" : "none",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-secondary/20" />

                {/* Password Change Section */}
                <div className="space-y-5 max-w-md">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    {t.profile.changePassword}
                  </h3>
                {/* Current Password */}
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground-muted">
                    {t.profile.currentPassword}
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Lock className={cn(
                        "w-5 h-5 transition-colors duration-300",
                        focusedField === "currentPassword" ? "text-primary" : "text-secondary/60"
                      )} />
                    </div>
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      onFocus={() => setFocusedField("currentPassword")}
                      onBlur={() => setFocusedField(null)}
                      placeholder={t.profile.enterCurrentPassword}
                      className="w-full h-12 pl-12 pr-12 bg-background border border-secondary/30 rounded-xl text-foreground placeholder:text-foreground-muted/50 transition-all duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                      style={{
                        boxShadow: focusedField === "currentPassword" ? "0 0 20px rgba(0, 229, 255, 0.2)" : "none",
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-primary transition-colors duration-300"
                      aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-foreground-muted">
                    {t.profile.newPassword}
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Lock className={cn(
                        "w-5 h-5 transition-colors duration-300",
                        focusedField === "newPassword" ? "text-primary" : "text-secondary/60"
                      )} />
                    </div>
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      onFocus={() => setFocusedField("newPassword")}
                      onBlur={() => setFocusedField(null)}
                      placeholder={t.profile.enterNewPassword}
                      className="w-full h-12 pl-12 pr-12 bg-background border border-secondary/30 rounded-xl text-foreground placeholder:text-foreground-muted/50 transition-all duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                      style={{
                        boxShadow: focusedField === "newPassword" ? "0 0 20px rgba(0, 229, 255, 0.2)" : "none",
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-primary transition-colors duration-300"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-foreground-muted">
                    {t.profile.confirmNewPassword}
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Shield className={cn(
                        "w-5 h-5 transition-colors duration-300",
                        focusedField === "confirmNewPassword" ? "text-primary" : "text-secondary/60"
                      )} />
                    </div>
                    <input
                      id="confirmNewPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      onFocus={() => setFocusedField("confirmNewPassword")}
                      onBlur={() => setFocusedField(null)}
                      placeholder={t.profile.confirmYourNewPassword}
                      className="w-full h-12 pl-12 pr-12 bg-background border border-secondary/30 rounded-xl text-foreground placeholder:text-foreground-muted/50 transition-all duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                      style={{
                        boxShadow: focusedField === "confirmNewPassword" ? "0 0 20px rgba(0, 229, 255, 0.2)" : "none",
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-primary transition-colors duration-300"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                </div>

                {/* Submit Button - Single button for all changes */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full sm:w-auto px-8 h-12 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                            fill="none"
                          />
                          <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>{t.profile.updating}</span>
                      </>
                    ) : (
                      t.profile.saveChanges
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
