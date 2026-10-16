import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { clearSession, currentArtist, type Artist, registerArtist, signIn } from '../lib/api'

interface Registration {
  email: string
  password: string
  displayName: string
  pseudonym: string
  role: string
  instruments: string[]
  bio: string
  artStyle: string
  backstory: string
  contactInfo: string
  avatarUrl?: string
  acceptedTerms: true
}
interface AuthContextValue {
  artist: Artist | null
  loading: boolean
  signInWithPassword(email: string, password: string): Promise<void>
  register(input: Registration): Promise<void>
  refreshArtist(): Promise<void>
  signOut(): void
}
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)
  const refreshArtist = useCallback(async () => {
    const result = await currentArtist()
    setArtist(result.user)
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('commonroom-token')) { setLoading(false); return }
    currentArtist().then(({ user }) => setArtist(user)).catch(() => clearSession()).finally(() => setLoading(false))
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    artist,
    loading,
    async signInWithPassword(email, password) { setArtist(await signIn(email, password)); },
    async register(input) { setArtist(await registerArtist(input)); },
    refreshArtist,
    signOut() { clearSession(); setArtist(null); },
  }), [artist, loading, refreshArtist])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}
