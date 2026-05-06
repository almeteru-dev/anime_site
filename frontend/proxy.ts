import { NextResponse, type NextRequest } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

type PublicSettings = {
  private_mode: boolean
  registration_disabled: boolean
}

let cached: { value: PublicSettings; fetchedAt: number } | null = null

async function getPublicSettings(): Promise<PublicSettings> {
  const now = Date.now()
  if (cached && now - cached.fetchedAt < 30_000) {
    return cached.value
  }

  const res = await fetch(`${API_URL}/settings/public`, { cache: "no-store" })
  if (!res.ok) {
    throw new Error("failed")
  }
  const data = (await res.json()) as Partial<PublicSettings>
  const value = {
    private_mode: data.private_mode === true,
    registration_disabled: data.registration_disabled === true,
  }
  cached = { value, fetchedAt: now }
  return value
}

function getJwtRoleFromCookie(token: string): string | null {
  const parts = token.split(".")
  if (parts.length < 2) return null
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"))
    return typeof payload?.role === "string" ? payload.role : null
  } catch {
    return null
  }
}

function isAllowedUnauthedPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/faq" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/cookies" ||
    pathname === "/dmca" ||
    pathname.startsWith("/verify-") ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  )
}

function redirectTo(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone()
  url.pathname = pathname
  url.search = ""
  return NextResponse.redirect(url)
}

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname === "/favicon.ico") {
    return NextResponse.next()
  }

  const tokenCookie = req.cookies.get("auth_token")?.value || ""
  const token = tokenCookie ? decodeURIComponent(tokenCookie) : ""
  const hasAuth = !!token

  if (pathname.startsWith("/admin")) {
    if (!hasAuth) {
      const url = req.nextUrl.clone()
      url.pathname = "/"
      url.search = ""
      return NextResponse.redirect(url)
    }
    const role = getJwtRoleFromCookie(token)
    if (role !== "admin" && role !== "root" && role !== "moderator") {
      const url = req.nextUrl.clone()
      url.pathname = "/"
      url.search = ""
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith("/admin/settings/root") && role !== "root") {
      const url = req.nextUrl.clone()
      url.pathname = "/"
      url.search = ""
      return NextResponse.redirect(url)
    }
  }

  try {
    const settings = await getPublicSettings()

    if (settings.registration_disabled && pathname === "/register") {
      return redirectTo(req, "/login")
    }

    if (pathname === "/forgot-password") {
      if (!searchParams.get("from")) {
        return redirectTo(req, "/login")
      }
    }
    if (pathname === "/reset-password") {
      if (!searchParams.get("token")) {
        return redirectTo(req, "/login")
      }
    }
    if (pathname === "/verify-email") {
      if (!searchParams.get("email")) {
        return redirectTo(req, "/login")
      }
    }

    if (settings.private_mode && !hasAuth && !isAllowedUnauthedPath(pathname)) {
      return redirectTo(req, "/login")
    }
  } catch {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/:path*"]
}
