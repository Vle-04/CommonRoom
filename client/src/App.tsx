import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthPage } from './components/auth/AuthPage'
import { PersonalProfilePage } from './components/profile/PersonalProfilePage'

function PrivateApp() {
  const { artist, loading } = useAuth()
  if (loading || !artist) return <AuthPage />
  return <PersonalProfilePage />
}

export default function App() {
  return <AuthProvider><PrivateApp /></AuthProvider>
}
