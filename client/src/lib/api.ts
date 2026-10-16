const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('commonroom-token')
  const response = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const payload = await response.json().catch(() => ({})) as T & { error?: string }
  if (!response.ok) throw new Error(payload.error ?? 'Request failed.')
  return payload
}

export interface ArtistSession {
  token: string
  user: Artist
}

export interface Artist {
  id: string
  email: string
  displayName: string
  pseudonym: string
  role: string
  avatarUrl: string | null
  bio?: string | null
  artStyle?: string | null
  backstory?: string | null
  instruments?: string[]
  contactInfo?: string | null
  _count?: { followers: number; following: number }
}

export async function currentArtist() {
  return apiRequest<{ user: Artist }>('/auth/me')
}

export async function signIn(email: string, password: string) {
  const session = await apiRequest<ArtistSession>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  localStorage.setItem('commonroom-token', session.token)
  return session.user
}

export async function registerArtist(input: { email: string; password: string; displayName: string; pseudonym: string; role: string; instruments: string[]; bio: string; artStyle: string; backstory: string; contactInfo: string; avatarUrl?: string; acceptedTerms: true }) {
  const session = await apiRequest<ArtistSession>('/auth/register', { method: 'POST', body: JSON.stringify(input) })
  localStorage.setItem('commonroom-token', session.token)
  return session.user
}

export function clearSession() {
  localStorage.removeItem('commonroom-token')
}
