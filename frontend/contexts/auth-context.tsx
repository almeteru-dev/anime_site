'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  username: string
  email: string
  role: string
  avatar_url?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User, rememberMe: boolean) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const savedToken = sessionStorage.getItem('token') || localStorage.getItem('token')
    const savedUser = sessionStorage.getItem('user') || localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail as { error_code?: string; ban_reason?: string } | undefined
      if (detail?.error_code === 'BANNED') {
        const reason = detail?.ban_reason ? ` Reason: ${detail.ban_reason}` : ''
        sessionStorage.setItem('force_logout_message', `You have been banned.${reason}`)
      } else if (detail?.error_code === 'NOT_VERIFIED') {
        sessionStorage.setItem('force_logout_message', 'Your account is not verified.')
      } else if (detail?.error_code === 'REVOKED') {
        sessionStorage.setItem('force_logout_message', 'Your session is no longer valid. Please sign in again.')
      }

      setToken(null)
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')

	  document.cookie = 'auth_token=; Path=/; Max-Age=0; SameSite=Lax'
      router.push('/login')
    }

    window.addEventListener('auth:force-logout', handler)
    return () => window.removeEventListener('auth:force-logout', handler)
  }, [router])

  const login = (newToken: string, newUser: User, rememberMe: boolean) => {
    setToken(newToken)
    setUser(newUser)

	if (rememberMe) {
		localStorage.setItem('token', newToken)
		localStorage.setItem('user', JSON.stringify(newUser))
		sessionStorage.removeItem('token')
		sessionStorage.removeItem('user')
	} else {
		sessionStorage.setItem('token', newToken)
		sessionStorage.setItem('user', JSON.stringify(newUser))
		localStorage.removeItem('token')
		localStorage.removeItem('user')
	}

	window.location.assign('/')
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
	sessionStorage.removeItem('token')
	sessionStorage.removeItem('user')

	document.cookie = 'auth_token=; Path=/; Max-Age=0; SameSite=Lax'
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
