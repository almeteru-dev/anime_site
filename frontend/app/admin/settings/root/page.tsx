"use client"

import { useEffect, useMemo, useState } from "react"
import { Eye, EyeOff, Save } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { adminSetDefaultPassword, adminSetPrivateMode, getPublicSettings } from "@/lib/api"
import { PasswordChecklist } from "@/components/password-checklist"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

function clientPasswordError(pw: string): string | null {
  if (pw.length < 10) return "Password must be at least 10 characters long"
  if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter"
  if (!/[0-9]/.test(pw)) return "Password must contain at least one digit"
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) return "Password must contain at least one special character"
  return null
}

export default function RootSettingsPage() {
  const { token, user: me } = useAuth()
  const router = useRouter()

  const [pw, setPw] = useState("")
  const [show, setShow] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [privateMode, setPrivateMode] = useState<boolean | null>(null)

  const pwError = useMemo(() => (pw.trim() ? clientPasswordError(pw) : null), [pw])

  useEffect(() => {
    if (me && me.role !== "root") {
      router.push("/admin/settings")
    }
  }, [me, router])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const s = await getPublicSettings()
        if (mounted) setPrivateMode(s.private_mode)
      } catch {
        if (mounted) setPrivateMode(null)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const onSaveDefaultPassword = async () => {
    if (!token) return
    if (me?.role !== "root") {
      setError("Root access required")
      return
    }
    setError(null)
    setNotice(null)

    const next = pw.trim()
    if (!next) {
      setError("Password is required")
      return
    }
    if (pwError) {
      setError(pwError)
      return
    }

    setIsBusy(true)
    try {
      await adminSetDefaultPassword({ token, password: next })
      setNotice("Default password updated")
      setPw("")
      setShow(false)
    } catch (e: any) {
      setError(e?.message || "Failed to update default password")
    } finally {
      setIsBusy(false)
    }
  }

  const onSavePrivateMode = async () => {
    if (!token) return
    if (me?.role !== "root") {
      setError("Root access required")
      return
    }
    if (privateMode === null) return
    setError(null)
    setNotice(null)
    setIsBusy(true)
    try {
      await adminSetPrivateMode({ token, enabled: privateMode })
      setNotice("Private Mode updated")
    } catch (e: any) {
      setError(e?.message || "Failed to update private mode")
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-lg font-semibold text-foreground">Root Settings</div>
        <div className="text-sm text-foreground-muted">Root-only global settings.</div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      ) : null}
      {notice ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</div>
      ) : null}

      <div className="rounded-2xl border border-border/60 bg-background-secondary/40 p-5">
        <div className="text-sm font-semibold text-foreground">Default Password</div>
        <div className="mt-1 text-xs text-foreground-muted">Used by “Reset to Default” in user editing.</div>

        <div className="mt-4 space-y-2">
          <label className="text-xs font-semibold text-foreground-muted">New default password</label>
          <div className="relative">
            <input
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              type={show ? "text" : "password"}
              disabled={isBusy}
              className={cn(
                "w-full h-11 rounded-xl bg-background border px-4 pr-12 text-sm text-foreground outline-none focus:border-primary/50",
                error ? "border-red-500/50" : "border-border/60"
              )}
              placeholder="LycorisLib$1"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              disabled={isBusy}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {pwError ? <div className="text-xs text-red-300">{pwError}</div> : null}
        </div>

        <div className="mt-3">
          <PasswordChecklist password={pw} />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onSaveDefaultPassword}
            disabled={isBusy}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90",
              isBusy && "opacity-60 cursor-not-allowed"
            )}
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-background-secondary/40 p-5">
        <div className="text-sm font-semibold text-foreground">Private Mode</div>
        <div className="mt-1 text-xs text-foreground-muted">When enabled, unauthenticated visitors are redirected to /login.</div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="text-sm text-foreground">Require login to view site</div>
          <input
            type="checkbox"
            checked={privateMode === true}
            onChange={(e) => setPrivateMode(e.target.checked)}
            disabled={isBusy || privateMode === null}
            className="h-5 w-5"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onSavePrivateMode}
            disabled={isBusy || privateMode === null}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90",
              (isBusy || privateMode === null) && "opacity-60 cursor-not-allowed"
            )}
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

